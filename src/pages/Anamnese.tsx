import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockage } from '../lib/storage';
import { BoutonMicroAvance } from '../lib/BoutonMicroAvance';
import ProfilPerso from '../components/ProfilPerso';
import { getProfil, profilEstComplet } from '../lib/profilPersonnel';

interface Anamnese {
  contexteActuel: string;
  situationDeclenchante: string;
  depuisQuand: string;
  enfance: string;
  adolescence: string;
  ageAdulte: string;
  momentBasculement: string;
  croyanceSurToi: string;
  croyanceSurAutres: string;
  croyanceSurVie: string;
  momentReussi: string;
  personneLAide: string;
  competences: string;
  objectifsTherapeutiques: string;
  dateRemplissage: string;
}

export default function Anamnese() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState(0);
  const [anamnese, setAnamnese] = useState<Anamnese>(() => {
    const stored = localStorage.getItem('tcc_anamnese');
    return stored
      ? JSON.parse(stored)
      : {
          contexteActuel: '',
          situationDeclenchante: '',
          depuisQuand: '',
          enfance: '',
          adolescence: '',
          ageAdulte: '',
          momentBasculement: '',
          croyanceSurToi: '',
          croyanceSurAutres: '',
          croyanceSurVie: '',
          momentReussi: '',
          personneLAide: '',
          competences: '',
          objectifsTherapeutiques: '',
          dateRemplissage: new Date().toISOString(),
        };
  });
  const [enEdition, setEnEdition] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const sections = [
    {
      titre: 'Pourquoi tu es la ?',
      description: 'Commencons par l instant present.',
      champs: [
        {
          id: 'situationDeclenchante',
          label: 'Qu est-ce qui t amene a chercher de l aide maintenant ?',
          placeholder: 'Decris la situation ou l evenement qui t a amenee ici...',
        },
        {
          id: 'depuisQuand',
          label: 'Depuis combien de temps ca te preoccupe ?',
          placeholder: 'Ex. : depuis 3 mois, depuis 2 ans...',
        },
      ],
    },
    {
      titre: 'Ton enfance',
      description: 'Les racines. Ce qui s est inscrit.',
      champs: [
        {
          id: 'enfance',
          label: 'Raconte-moi ton enfance',
          placeholder: 'Contexte familial, atmosphere, evenements importants, figure d attachement...',
        },
      ],
    },
    {
      titre: 'Ton adolescence',
      description: 'Les transformations.',
      champs: [
        {
          id: 'adolescence',
          label: 'Raconte-moi ton adolescence',
          placeholder: 'Relations, amis, ecole, corps, identite...',
        },
      ],
    },
    {
      titre: 'Ton age adulte',
      description: 'Les grandes etapes.',
      champs: [
        {
          id: 'ageAdulte',
          label: 'Raconte-moi ton histoire d adulte',
          placeholder: 'Carriere, relations, maternite, separations...',
        },
      ],
    },
    {
      titre: 'Le moment de basculement',
      description: 'Ou ca a commence a deraper.',
      champs: [
        {
          id: 'momentBasculement',
          label: 'Quand a-t-on commence a remarquer un changement ?',
          placeholder: 'Y a-t-il eu UN moment ? Une rupture ? Un evenement ?',
        },
      ],
    },
    {
      titre: 'Ce que tu crois de toi',
      description: 'Ta croyance profonde.',
      champs: [
        {
          id: 'croyanceSurToi',
          label: 'Complete : Je suis...',
          placeholder: 'Je suis nulle, je ne suis jamais a la hauteur...',
        },
      ],
    },
    {
      titre: 'Ce que tu crois des autres',
      description: 'Tes croyances sur les gens.',
      champs: [
        {
          id: 'croyanceSurAutres',
          label: 'Complete : Les gens sont...',
          placeholder: 'Ils vont me quitter, on ne peut pas compter sur personne...',
        },
      ],
    },
    {
      titre: 'Ce que tu crois de la vie',
      description: 'Tes croyances globales.',
      champs: [
        {
          id: 'croyanceSurVie',
          label: 'Complete : La vie c est...',
          placeholder: 'Dangereuse, injuste, je dois tout controler...',
        },
      ],
    },
    {
      titre: 'Tes ressources',
      description: 'Tes forces et ta resilience.',
      champs: [
        {
          id: 'momentReussi',
          label: 'Un moment ou tu as reussi',
          placeholder: 'Raconte un moment ou tu t en es sortie...',
        },
        {
          id: 'personneLAide',
          label: 'Une personne qui t a aidee',
          placeholder: 'Quelqu un qui t a cru en toi...',
        },
        {
          id: 'competences',
          label: 'Tes qualites',
          placeholder: 'Tu es loyale ? Tu ecoutes ? Tu as du courage ?',
        },
      ],
    },
    {
      titre: 'Tes objectifs',
      description: 'Ou tu veux arriver.',
      champs: [
        {
          id: 'objectifsTherapeutiques',
          label: 'Qu est-ce que tu aimerais changer ?',
          placeholder: 'Si la therapie fonctionnait, qu est-ce que tu ferais differemment ?',
        },
      ],
    },
  ];

  const handleChange = (fieldId: string, value: string) => {
    setAnamnese(prev => ({
      ...prev,
      [fieldId]: value,
      dateRemplissage: new Date().toISOString(),
    }));
  };

  // Auto-scroll quand textarea focus (mobile)
  useEffect(() => {
    if (isMobile && textareaRef.current && enEdition) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [etape, enEdition, isMobile]);

  const sauvegarder = () => {
    localStorage.setItem('tcc_anamnese', JSON.stringify(anamnese));
    stockage.declencherSync(); // pousse aussi vers Google Drive si connecté
    setEnEdition(false);
    alert('Ton histoire est sauvegardee. L IA va maintenant vraiment te connaitre. 💚');
  };

  const pourcentageComplete = Object.values(anamnese)
    .filter(v => v && v !== new Date().toISOString())
    .length / (Object.keys(anamnese).length - 1) * 100;

  // MODE CONSULTATION
  if (!enEdition) {
    return (
      <div className="page">
        <div className="conteneur-etroit apparition" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: isMobile ? '1.6rem' : '2.2rem' }}>Mon histoire</h1>
          <p style={{ color: 'var(--encre-2)', marginTop: '0.4rem', marginBottom: '1.4rem', fontSize: '0.95rem' }}>
            Ce que je sais de toi.
          </p>

          {/* Profil personnel — genre, âge, prénom */}
          <div style={{ marginBottom: '1.5rem' }}>
            <ProfilPerso />
          </div>

          {pourcentageComplete > 0 && (
            <button
              className="btn btn-ambre apparition"
              style={{
                width: '100%',
                marginBottom: '1.5rem',
                padding: '1rem 1.2rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onClick={() => navigate('/assistant', { state: { autoStart: true } })}
            >
              🎙️ Parler à l'IA de mon histoire
            </button>
          )}

          {pourcentageComplete === 0 ? (
            <div className="carte" style={{ textAlign: 'center', padding: '2rem 1.2rem' }}>
              <p style={{ color: 'var(--encre-3)', marginBottom: '1.2rem', fontSize: '0.95rem' }}>
                Tu n as pas encore rempli ton histoire.
              </p>
              <button 
                className="btn btn-primaire" 
                onClick={() => setEnEdition(true)}
                style={{ 
                  padding: '0.8rem 1.6rem', 
                  fontSize: '1rem',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                Commencer
              </button>
            </div>
          ) : (
            <>
              <div className="carte" style={{ marginBottom: '1.4rem' }}>
                <div style={{ marginBottom: '0.8rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--encre-3)', marginBottom: '0.4rem' }}>
                    Completude de ton profil
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#EEE',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      background: 'var(--sauge)',
                      width: `${pourcentageComplete}%`,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--encre-2)', marginTop: '0.3rem' }}>
                    {Math.round(pourcentageComplete)}%
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {sections.map((section, idx) => (
                  <div key={idx} className="carte" style={{ borderLeft: '3px solid var(--sauge)', padding: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.6rem', color: 'var(--sauge-fonce)', fontSize: '1.05rem' }}>
                      {section.titre}
                    </h3>
                    {section.champs.map(champ => {
                      const valeur = anamnese[champ.id as keyof Anamnese];
                      return (
                        <div key={champ.id} style={{ marginBottom: '0.6rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--encre-3)', marginBottom: '0.3rem' }}>
                            {champ.label}
                          </div>
                          <div style={{
                            fontSize: '0.9rem',
                            color: valeur ? 'var(--encre)' : 'var(--encre-3)',
                            fontStyle: valeur ? 'normal' : 'italic',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.5,
                          }}>
                            {valeur || '(non rempli)'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <button 
                className="btn btn-primaire" 
                onClick={() => setEnEdition(true)} 
                style={{ 
                  marginTop: '1.4rem', 
                  width: '100%',
                  padding: '0.8rem 1.2rem',
                  fontSize: '1rem',
                }}
              >
                Modifier mon histoire
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // MODE EDITION
  const section = sections[etape];

  return (
    <div className="page" style={{ position: 'relative' }}>
      <style>{`
        @media (max-width: 639px) {
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          textarea {
            font-size: 16px !important;
          }
        }
      `}</style>

      <div className="conteneur-etroit apparition" style={{ paddingTop: '1rem', paddingBottom: '1.5rem' }}>
        {/* Barre de progression */}
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--encre-3)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Etape {etape + 1} / {sections.length}
          </div>
          <div style={{ height: '6px', background: '#EEE', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'var(--sauge)',
              width: `${((etape + 1) / sections.length) * 100}%`,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Titre et description */}
        <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', marginBottom: '0.3rem' }}>
          {section.titre}
        </h1>
        <p style={{ color: 'var(--encre-2)', marginTop: '0.3rem', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
          {section.description}
        </p>

        {/* Champs */}
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.4rem' }}>
          {section.champs.map((champ, idx) => (
            <div key={champ.id} className="champ">
              <label style={{ 
                fontWeight: 600, 
                marginBottom: '0.5rem', 
                display: 'block',
                fontSize: '0.95rem',
              }}>
                {champ.label}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <textarea
                  ref={idx === 0 ? textareaRef : null}
                  value={anamnese[champ.id as keyof Anamnese] || ''}
                  onChange={e => handleChange(champ.id, e.target.value)}
                  placeholder={champ.placeholder}
                  style={{
                    flex: 1,
                    padding: '0.8rem 1rem',
                    border: '1.5px solid #DDD5C7',
                    borderRadius: 'var(--rayon-sm)',
                    fontFamily: 'inherit',
                    fontSize: isMobile ? '16px' : '1rem',
                    minHeight: isMobile ? '160px' : '120px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    lineHeight: 1.5,
                    WebkitAppearance: 'none',
                    appearance: 'none',
                  }}
                  onFocus={e => {
                    if (isMobile) {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }
                  }}
                />
                <div style={{ paddingTop: '0.3rem' }}>
                  <BoutonMicroAvance 
                    onTexteDicte={(texte) => {
                      const actuellement = anamnese[champ.id as keyof Anamnese] || '';
                      const nouveau = actuellement ? `${actuellement} ${texte}` : texte;
                      handleChange(champ.id, nouveau);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Boutons de navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '0.6rem', 
          justifyContent: 'space-between',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <button
            className="btn btn-doux"
            onClick={() => setEnEdition(false)}
            style={{ 
              padding: '0.8rem 1.2rem',
              fontSize: '0.95rem',
              flex: isMobile ? '1' : 'auto',
              minWidth: isMobile ? '100px' : 'auto',
            }}
          >
            Annuler
          </button>

          <div style={{ 
            display: 'flex', 
            gap: '0.6rem',
            flex: isMobile ? '1' : 'auto',
            justifyContent: isMobile ? 'flex-end' : 'flex-start',
          }}>
            {etape > 0 && (
              <button 
                className="btn btn-doux" 
                onClick={() => setEtape(e => e - 1)}
                style={{ 
                  padding: '0.8rem 1.2rem',
                  fontSize: '0.95rem',
                }}
              >
                Prec
              </button>
            )}

            {etape < sections.length - 1 ? (
              <button 
                className="btn btn-primaire" 
                onClick={() => setEtape(e => e + 1)}
                style={{ 
                  padding: '0.8rem 1.2rem',
                  fontSize: '0.95rem',
                  flex: isMobile ? '1' : 'auto',
                  minWidth: isMobile ? '100px' : 'auto',
                }}
              >
                Suivant
              </button>
            ) : (
              <button 
                className="btn btn-primaire" 
                onClick={sauvegarder}
                style={{ 
                  padding: '0.8rem 1.2rem',
                  fontSize: '0.95rem',
                  flex: isMobile ? '1' : 'auto',
                  minWidth: isMobile ? '100px' : 'auto',
                }}
              >
                Terminer
              </button>
            )}
          </div>
        </div>

        {/* Conseil */}
        <div className="encart encart-info" style={{ marginTop: '1.2rem', fontSize: '0.85rem' }}>
          <strong>Conseil :</strong> Sois honnete. L IA l utilise pour t aider vraiment.
        </div>
      </div>
    </div>
  );
}
