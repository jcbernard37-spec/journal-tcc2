/**
 * Google Drive Sync & PDF Export
 * 
 * Permet de:
 * 1. Auto-sync toutes les sessions sur Google Drive
 * 2. Exporter en PDF pour partager avec thérapeute
 * 3. Accéder à l'historique depuis n'importe quel appareil
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DriveSession {
  id: string;
  type: string;
  date: string;
  efficacite: number;
  duree: number;
  notes?: string;
  avantApres?: { avant: number; apres: number };
}

/**
 * Initialise Google Drive API (OAuth 2.0)
 */
export async function initializeGoogleDrive(): Promise<boolean> {
  try {
    // Charge la Google API
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    document.head.appendChild(script);

    return new Promise((resolve) => {
      script.onload = () => {
        (window as any).gapi.load('client:auth2', () => {
          // Note: Ces clés sont optionnelles et définies dans Vercel Settings
      (window as any).gapi.client
            .init({
              apiKey: (window as any).__GOOGLE_API_KEY || '',
              clientId: (window as any).__GOOGLE_CLIENT_ID || '',
              scope: 'https://www.googleapis.com/auth/drive.file',
              discoveryDocs: [
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
              ],
            })
            .then(() => {
              resolve(true);
            })
            .catch((error: any) => {
              console.error('Error initializing Google Drive:', error);
              resolve(false);
            });
        });
      };
    });
  } catch (error) {
    console.error('Error loading Google API:', error);
    return false;
  }
}

/**
 * Synchronise les sessions sur Google Drive
 */
export async function syncSessionsToDrive(): Promise<boolean> {
  try {
    const gapi = (window as any).gapi;
    if (!gapi || !gapi.auth2) {
      console.error('Google API not initialized');
      return false;
    }

    // Check si utilisateur est connecté
    const auth = gapi.auth2.getAuthInstance();
    if (!auth || !auth.isSignedIn.get()) {
      // Demander sign-in
      await auth.signIn();
    }

    // Récupère toutes les sessions
    const stored = localStorage.getItem('tcc_sessions_therapie') || '[]';
    const sessions = JSON.parse(stored);

    if (sessions.length === 0) {
      console.log('Aucune session à synchroniser');
      return true;
    }

    // Prépare les données
    const data = {
      timestamp: new Date().toISOString(),
      sessions: sessions,
      totalSessions: sessions.length,
      averageEffectiveness: sessions.reduce((sum: number, s: any) => sum + (s.efficacite || 0), 0) / sessions.length,
    };

    // Crée ou met à jour le fichier sur Drive
    const fileId = await findOrCreateDriveFile();
    if (!fileId) {
      console.error('Could not create Drive file');
      return false;
    }

    // Upload les données
    const response = await gapi.client.drive.files.update({
      fileId: fileId,
      media: {
        mimeType: 'application/json',
        body: JSON.stringify(data, null, 2),
      },
    });

    console.log('Synced to Drive:', response.result);
    return true;
  } catch (error) {
    console.error('Error syncing to Drive:', error);
    return false;
  }
}

/**
 * Cherche ou crée le fichier "Journal-TCC-Sessions" sur Drive
 */
async function findOrCreateDriveFile(): Promise<string | null> {
  try {
    const gapi = (window as any).gapi;

    // Cherche le fichier existant
    const response = await gapi.client.drive.files.list({
      q: "name='Journal-TCC-Sessions.json' and trashed=false",
      spaces: 'drive',
      fields: 'files(id, name)',
      pageSize: 1,
    });

    if (response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    // Crée un nouveau fichier
    const file = new Blob([JSON.stringify({ sessions: [] })], {
      type: 'application/json',
    });

    const createResponse = await gapi.client.drive.files.create({
      resource: {
        name: 'Journal-TCC-Sessions.json',
        mimeType: 'application/json',
      },
      media: {
        mimeType: 'application/json',
        body: file,
      },
      fields: 'id',
    });

    return createResponse.result.id;
  } catch (error) {
    console.error('Error finding/creating Drive file:', error);
    return null;
  }
}

/**
 * Exporte les sessions en PDF professionnel
 */
export function exportSessionsToPDF(): void {
  try {
    const stored = localStorage.getItem('tcc_sessions_therapie') || '[]';
    const anamnese = localStorage.getItem('tcc_anamnese');
    const sessions: DriveSession[] = JSON.parse(stored);

    if (sessions.length === 0) {
      alert('Aucune session à exporter');
      return;
    }

    // Crée le PDF
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;

    // En-tête
    doc.setFontSize(20);
    doc.text('Journal TCC - Rapport de Sessions', pageWidth / 2, yPosition, {
      align: 'center',
    });

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, {
      align: 'center',
    });

    yPosition += 15;

    // Stats générales
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text('Résumé', 15, yPosition);

    yPosition += 8;
    doc.setFontSize(10);

    const stats = [
      `Total de sessions: ${sessions.length}`,
      `Efficacité moyenne: ${(sessions.reduce((sum, s) => sum + (s.efficacite || 0), 0) / sessions.length).toFixed(1)}/10`,
      `Durée totale: ${sessions.reduce((sum, s) => sum + (s.duree || 0), 0)} minutes`,
      `Dernière session: ${sessions[sessions.length - 1]?.date || 'N/A'}`,
    ];

    stats.forEach((stat) => {
      doc.text(`• ${stat}`, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Tableau des sessions
    doc.setFontSize(12);
    doc.text('Détail des Sessions', 15, yPosition);

    yPosition += 8;

    const tableData = sessions.map((session) => [
      new Date(session.date).toLocaleDateString(),
      session.type,
      session.duree ? `${session.duree} min` : '-',
      `${session.efficacite}/10`,
      session.avantApres
        ? `${session.avantApres.avant} → ${session.avantApres.apres}`
        : '-',
    ]);

    (doc as any).autoTable({
      head: [['Date', 'Type', 'Durée', 'Efficacité', 'Avant/Après']],
      body: tableData,
      startY: yPosition,
      margin: { top: 10, right: 15, bottom: 15, left: 15 },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [107, 207, 127], // Vert sauge
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Page 2: Observations
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(14);
    doc.text('Observations et Notes', 15, yPosition);

    yPosition += 15;
    doc.setFontSize(10);

    // Pattern d'outils
    const toolCount: Record<string, number> = {};
    sessions.forEach((s) => {
      toolCount[s.type] = (toolCount[s.type] || 0) + 1;
    });

    doc.text('Outils les plus utilisés:', 15, yPosition);
    yPosition += 6;

    Object.entries(toolCount)
      .sort(([, a], [, b]) => b - a)
      .forEach(([tool, count]) => {
        doc.text(`  • ${tool}: ${count} fois`, 20, yPosition);
        yPosition += 5;
      });

    yPosition += 10;

    doc.text('Recommandations:', 15, yPosition);
    yPosition += 6;

    const recommendations = generateRecommendations(sessions);
    recommendations.forEach((rec) => {
      const wrappedText = doc.splitTextToSize(rec, 170);
      doc.text(wrappedText, 20, yPosition);
      yPosition += wrappedText.length * 4 + 3;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'Ce rapport est confidentiel et destiné au professionnel de santé mentale accompagnant.',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Télécharge
    doc.save(`Journal-TCC-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('Erreur lors de l\'export PDF');
  }
}

/**
 * Génère des recommandations basées sur les données
 */
function generateRecommendations(sessions: DriveSession[]): string[] {
  const recommendations: string[] = [];

  // Outil le plus efficace
  const toolEffectiveness: Record<string, number[]> = {};
  sessions.forEach((s) => {
    if (!toolEffectiveness[s.type]) {
      toolEffectiveness[s.type] = [];
    }
    toolEffectiveness[s.type].push(s.efficacite || 0);
  });

  const topTool = Object.entries(toolEffectiveness)
    .map(([tool, scores]) => [
      tool,
      scores.reduce((a, b) => a + b, 0) / scores.length,
    ])
    .sort(([, a], [, b]) => (b as number) - (a as number))[0];

  if (topTool) {
    recommendations.push(
      `Continue à utiliser ${topTool[0]} - c'est ton outil le plus efficace (${(topTool[1] as number).toFixed(1)}/10).`
    );
  }

  // Fréquence
  const daysActive = new Set(sessions.map((s) => s.date.split('T')[0])).size;
  if (daysActive < sessions.length / 2) {
    recommendations.push(
      `Augmente la fréquence de tes sessions. Vise 4-5 sessions par semaine pour des résultats exponentiels.`
    );
  }

  // Tendance
  const recentAvg =
    sessions
      .slice(-5)
      .reduce((sum, s) => sum + (s.efficacite || 0), 0) / Math.min(5, sessions.length);
  const olderAvg =
    sessions
      .slice(0, Math.max(1, sessions.length - 5))
      .reduce((sum, s) => sum + (s.efficacite || 0), 0) / Math.max(1, sessions.length - 5);

  if (recentAvg > olderAvg) {
    recommendations.push(
      `Tendance positive! Ton efficacité s'améliore. Continue ce que tu fais.`
    );
  }

  return recommendations;
}

/**
 * Charge les sessions depuis Google Drive
 */
export async function loadSessionsFromDrive(): Promise<DriveSession[] | null> {
  try {
    const gapi = (window as any).gapi;
    if (!gapi || !gapi.auth2) {
      return null;
    }

    const auth = gapi.auth2.getAuthInstance();
    if (!auth?.isSignedIn.get()) {
      return null;
    }

    const fileId = await findOrCreateDriveFile();
    if (!fileId) return null;

    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    return response.result.sessions || [];
  } catch (error) {
    console.error('Error loading from Drive:', error);
    return null;
  }
}

export default {
  initializeGoogleDrive,
  syncSessionsToDrive,
  exportSessionsToPDF,
  loadSessionsFromDrive,
};
