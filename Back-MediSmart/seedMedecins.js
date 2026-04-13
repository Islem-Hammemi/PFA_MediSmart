const bcrypt = require("bcrypt");
const mysql  = require("mysql2/promise");

const SALT_ROUNDS      = 10;
const DEFAULT_PASSWORD = "Medismart@2024";

const medecins = [
  { nom: "Belhaj",    prenom: "Ahmed",   email: "ahmed.belhaj@medismart.tn",    specialite: "Dermatologie",       numero_ordre: "ORD-2024-001", statut: "disponible"      },
  { nom: "Gharbi",    prenom: "Nour",    email: "nour.gharbi@medismart.tn",     specialite: "Gynécologie",        numero_ordre: "ORD-2024-002", statut: "disponible"      },
  { nom: "Hammami",   prenom: "Islem",   email: "islem.hammami@medismart.tn",   specialite: "Cardiologie",        numero_ordre: "ORD-2024-003", statut: "absent"          },
  { nom: "Lassoued",  prenom: "Syrine",  email: "syrine.lassoued@medismart.tn", specialite: "Neurologie",         numero_ordre: "ORD-2024-004", statut: "absent"          },
  { nom: "Mrad",      prenom: "Rania",   email: "rania.mrad@medismart.tn",      specialite: "Cardiologie",        numero_ordre: "ORD-2024-005", statut: "disponible"      },
  { nom: "Othmani",   prenom: "Sarra",   email: "sarra.othmani@medismart.tn",   specialite: "Cardiologie",        numero_ordre: "ORD-2024-006", statut: "disponible"      },
  { nom: "Quarteni",  prenom: "Shaima",  email: "shaima.quarteni@medismart.tn", specialite: "Pédiatrie",          numero_ordre: "ORD-2024-007", statut: "disponible"      },
  { nom: "Zouari",    prenom: "Karim",   email: "karim.zouari@medismart.tn",    specialite: "Orthopédie",         numero_ordre: "ORD-2024-008", statut: "absent"          },
  { nom: "Ayedi",     prenom: "Oussema", email: "oussema.ayedi@medismart.tn",   specialite: "Cardiologie",        numero_ordre: "ORD-2024-009", statut: "en_consultation" },
  { nom: "Ben Ali",   prenom: "Leila",   email: "leila.benali@medismart.tn",    specialite: "Ophtalmologie",      numero_ordre: "ORD-2024-010", statut: "disponible"      },
  { nom: "Trabelsi",  prenom: "Mehdi",   email: "mehdi.trabelsi@medismart.tn",  specialite: "Psychiatrie",        numero_ordre: "ORD-2024-011", statut: "disponible"      },
  { nom: "Chaari",    prenom: "Amira",   email: "amira.chaari@medismart.tn",    specialite: "Endocrinologie",     numero_ordre: "ORD-2024-012", statut: "en_consultation" },
  { nom: "Sellami",   prenom: "Youssef", email: "youssef.sellami@medismart.tn", specialite: "Rhumatologie",       numero_ordre: "ORD-2024-013", statut: "disponible"      },
  { nom: "Jebali",    prenom: "Ines",    email: "ines.jebali@medismart.tn",     specialite: "Gastro-enterologie", numero_ordre: "ORD-2024-014", statut: "absent"          },
  { nom: "Mahjoub",   prenom: "Bilel",   email: "bilel.mahjoub@medismart.tn",   specialite: "Urologie",           numero_ordre: "ORD-2024-015", statut: "disponible"      },
  { nom: "Boughanmi", prenom: "Rim",     email: "rim.boughanmi@medismart.tn",   specialite: "Pneumologie",        numero_ordre: "ORD-2024-016", statut: "disponible"      },
  { nom: "Ferchichi", prenom: "Tarek",   email: "tarek.ferchichi@medismart.tn", specialite: "ORL",                numero_ordre: "ORD-2024-017", statut: "en_consultation" },
  { nom: "Najar",     prenom: "Salma",   email: "salma.najar@medismart.tn",     specialite: "Radiologie",         numero_ordre: "ORD-2024-018", statut: "disponible"      },
  { nom: "Riahi",     prenom: "Omar",    email: "omar.riahi@medismart.tn",      specialite: "Anesthesiologie",    numero_ordre: "ORD-2024-019", statut: "absent"          },
  { nom: "Bouaziz",   prenom: "Fatma",   email: "fatma.bouaziz@medismart.tn",   specialite: "Medecine generale",  numero_ordre: "ORD-2024-020", statut: "disponible"      },
];

async function insertMedecins() {
  const db = await mysql.createConnection({
    host:     "localhost",
    user:     "root",   // ← change si nécessaire
    password: "",       // ← ton mot de passe MySQL
    database: "medismart",
  });

  console.log("Hashing passwords...");
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  for (const m of medecins) {
    const [userResult] = await db.execute(
      `INSERT INTO users (email, password_hash, nom, prenom, role) VALUES (?, ?, ?, ?, 'medecin')`,
      [m.email, passwordHash, m.nom, m.prenom]
    );

    const userId = userResult.insertId;

    await db.execute(
      `INSERT INTO medecins (user_id, specialite, numero_ordre, statut) VALUES (?, ?, ?, ?)`,
      [userId, m.specialite, m.numero_ordre, m.statut]
    );

    console.log(`OK: Dr. ${m.prenom} ${m.nom} inserted (user_id: ${userId})`);
  }

  console.log("\nDone! 20 doctors inserted.");
  console.log("Default password for all: " + DEFAULT_PASSWORD);
  await db.end();
}

insertMedecins().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});