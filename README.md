# 🏨 SGAFO : Système de Gestion et de Réservation Hôtelière (B2B)

![Laravel](https://img.shields.io/badge/Backend-Laravel_12-red?style=for-the-badge&logo=laravel)
![React](https://img.shields.io/badge/Frontend-React_19-blue?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Style-Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Status](https://img.shields.io/badge/Statut-Phase_Conception-orange?style=for-the-badge)

## 📌 Présentation du Projet
Le projet **SGAFO** est une solution SaaS de transformation digitale conçue pour moderniser les flux de réservation entre les hôtels et leurs partenaires commerciaux (Agences de Voyage, Guides). 

L'application élimine les goulots d'étranglement liés aux échanges d'emails manuels en proposant une interface de réservation dynamique, sécurisée et automatisée.

## 🚀 Fonctionnalités Clés
- **🔑 Accès Passwordless** : Authentification des agences via tokens uniques et sécurisés.
- **📊 Gestion Multi-Groupes** : Capacité de gérer plusieurs segments de voyageurs dans un seul dossier.
- **💰 Tarification Dynamique** : Calcul automatique des prix selon les saisons, types de chambres et remises agences.
- **🧾 Validation des Paiements** : Workflow de dépôt et de vérification des preuves de virement.
- **📈 Dashboard Admin** : Pilotage en temps réel des stocks, revenus et taux d'occupation.

## 🛠️ Stack Technique
*   **Core** : Laravel 12 / React 19 / Inertia.js
*   **Base de Données** : MySQL (Modèle relationnel complexe à 15 entités)
*   **Sécurité** : Laravel Sanctum & Token-based access
*   **UI/UX** : Tailwind CSS 4 & Headless UI

## ⚙️ Installation & Configuration

### Pré-requis
- PHP 8.2+
- Node.js 20+
- Composer & NPM

### Étapes d'installation
1. **Cloner le projet**
   ```bash
   git clone [url-du-repo]
   cd SGAFO/backend
   ```
2. **Configuration Backend**
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   ```
3. **Base de Données**
   ```bash
   # Configurez votre DB dans le .env, puis :
   php artisan migrate --seed
   ```
4. **Configuration Frontend**
   ```bash
   npm install
   npm run dev
   ```

## 📄 Documentation de Conception
Le projet s'appuie sur une conception UML rigoureuse (disponible dans les fichiers joints) :
- [📘 Cahier des Charges](./CDC_GRH.md)
- [📐 Modèle Conceptuel de Données (MCD)](./CONCEPTION_GRH.md)
- [🔄 Diagrammes de Séquence (Flux métier)](./CONCEPTION_GRH.md)

---
> *Développé dans le cadre d'un stage de fin d'études chez **eurika digital**.*
