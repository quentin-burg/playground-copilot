# Exercices Post-Cours — IA Générative pour le Développement

Ces exercices permettent d'approfondir les concepts vus en cours. Ils sont progressifs et peuvent être réalisés de manière autonome.

---

## 📋 Exercice 1: Créer un Agent "Security Analyzer"

**Objectif**: Créer un agent custom qui analyse le code pour détecter les vulnérabilités de sécurité courantes.

**Niveau**: ⭐⭐☆☆☆ (Intermédiaire)

### Instructions

1. Créer le fichier `.github/agents/security-analyzer.agent.md`

2.Utiliser cette structure YAML:
\`\`\`yaml
---
name: "security-analyzer"
description: "Analyse le code TypeScript pour détecter les vulnérabilités de sécurité. Utiliser lors de review de code ou avant merge."
argument-hint: "Fichier ou module à analyser"
tools:
  - read_file
  - grep_search
  - run_in_terminal
---
\`\`\`

3. L'agent doit vérifier:
   - ❌ Utilisation de \`eval()\` ou \`Function()\`
   - ❌ Injections SQL potentielles (concaténation de strings SQL)
   - ❌ Variables d'environnement exposées dans le code
   - ❌ Mots de passe ou secrets en dur
   - ❌ Validation manquante sur les entrées utilisateur
   - ✅ Utilisation de bibliothèques de validation (Zod)
   - ✅ Sanitization des données

4. L'agent doit produire un rapport:
   - Score de sécurité (/10)
   - Liste des vulnérabilités trouvées avec gravité (🔴 critique, 🟡 moyenne, 🟢 info)
   - Recommandations de correction

### Critères de Validation

- [ ] L'agent s'invoque via \`/security-analyzer\`
- [ ] Détecte au moins 5 types de vulnérabilités
- [ ] Produit un rapport structuré avec recommandations
- [ ] Fonctionne sur les fichiers du projet Task Manager

---

## 📋 Exercice 2: Créer un Skill "Async Patterns"

**Objectif**: Créer un skill qui documente les patterns asynchrones TypeScript et aide à éviter les bugs courants.

**Niveau**: ⭐⭐⭐☆☆ (Avancé)

### Instructions

1. Créer la structure:
\`\`\`bash
.github/skills/async-patterns/
├── SKILL.md
└── examples.ts (optionnel)
\`\`\`

2. Le SKILL.md doit couvrir au minimum:

**Pattern 1: Promise.all vs Promise.allSettled**  
**Pattern 2: Race Conditions**  
**Pattern 3: Timeout et Retry**  
**Pattern 4: Error Handling Async**  
**Pattern 5: AbortController pour annulation**

3. Frontmatter YAML:
\`\`\`yaml
---
name: "async-patterns"
description: "Patterns asynchrones TypeScript avancés. Utiliser pour implémenter des opérations async complexes, éviter race conditions, gérer timeouts et retries."
user-invocable: true
disable-model-invocation: false
---
\`\`\`

### Critères de Validation

- [ ] Le skill est visible dans le panneau AI Customization
- [ ] Contient au moins 5 patterns avec exemples ❌/✅
- [ ] S'invoque automatiquement lors de l'écriture de code async
- [ ] Peut être invoqué manuellement via \`/skill async-patterns\`

---

## 📋 Exercice 3: Créer une Instruction "API Versioning"

**Objectif**: Créer une instruction qui impose les bonnes pratiques de versioning d'API REST.

**Niveau**: ⭐⭐☆☆☆ (Intermédiaire)

### Instructions

1. Créer \`.github/instructions/api-versioning.instructions.md\`

2. Frontmatter:
\`\`\`yaml
---
description: "Standards de versioning pour les endpoints API REST"
applyTo: "**/routes/**/*.ts, **/api/**/*.ts"
---
\`\`\`

3. L'instruction doit imposer:
   - **Stratégie de versioning**: URL-based (\`/api/v1/tasks\`)
   - **Breaking changes**: nouvelle version majeure obligatoire
   - **Deprecation**: headers et dates de sunset

### Critères de Validation

- [ ] L'instruction s'applique uniquement aux fichiers routes/API
- [ ] Détecte les endpoints sans version
- [ ] Suggère automatiquement des numéros de version
- [ ] Rappelle les règles de breaking changes

---

## 📋 Exercice 4: Créer un Prompt "Generate OpenAPI Spec"

**Objectif**: Créer un prompt réutilisable qui génère une spécification OpenAPI 3.0 à partir du code API.

**Niveau**: ⭐⭐⭐⭐☆ (Expert)

### Instructions

1. Créer \`.github/prompts/generate-openapi.prompt.md\`

2. Le prompt doit:
   - Scanner tous les fichiers dans \`src/api/routes/\`
   - Extraire les endpoints (méthode HTTP, path, paramètres)
   - Extraire les schémas Zod et les convertir en JSON Schema
   - Générer un fichier \`openapi.yaml\` valide

### Critères de Validation

- [ ] Génère un fichier OpenAPI 3.0 valide
- [ ] Tous les endpoints sont documentés
- [ ] Les schémas sont corrects (types, required, constraints)
- [ ] Peut être importé dans Swagger UI ou Postman

---

## 📋 Exercice 5: Mini-Projet Personnel

**Objectif**: Créer votre propre application avec customisation IA complète.

**Niveau**: ⭐⭐⭐⭐⭐ (Projet complet)

### Idées d'Applications

Choisissez une de ces applications et implémentez-la avec:
- Au moins 2 instructions custom
- Au moins 1 agent custom
- Au moins 1 skill
- Au moins 1 prompt réutilisable

**Option A: Système de Blog**
- CRUD articles (titre, contenu markdown, tags, auteur)
- Commentaires
- Recherche full-text

**Option B: API de Gestion de Stock**
- Produits, catégories, fournisseurs
- Mouvements de stock (entrées/sorties)
- Alertes de rupture de stock

**Option C: Plateforme de Quiz**
- Questions à choix multiples
- Sessions de quiz avec timer
- Scoring et classement

### Livrables

- [ ] Code complet sur GitHub (public ou privé)
- [ ] README.md expliquant l'application et les customisations
- [ ] Démonstration video (5 min) montrant l'utilisation

---

## 💡 Conseils

1. **Commencez simple**: Ne créez pas un agent complexe dès le départ
2. **Itérez**: Créez une première version, testez-la, puis améliorez
3. **Documentez**: Expliquez dans vos fichiers POURQUOI vous avez fait certains choix
4. **Testez**: Vérifiez que vos customisations apparaissent dans le panneau AI Customization

**Bon courage et amusez-vous bien ! 🚀**
