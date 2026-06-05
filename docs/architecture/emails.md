# Emails transactionnels

## Principe

Le systeme email passe par `EmailService` et `TransactionalEmailService`. Les emails sont construits depuis des templates, envoyes via un provider, puis journalises dans `email_delivery_logs`.

## Providers

Deux providers existent :

- Mailtrap pour le developpement.
- Brevo pour la production.

La selection se fait via `EMAIL_PROVIDER`. Par defaut, le code utilise Mailtrap hors production et Brevo en production.

## Configuration utile

- `EMAIL_FROM_EMAIL`, `EMAIL_FROM_NAME` : expediteur.
- `EMAIL_MONTHLY_QUOTA` : quota mensuel par utilisateur emetteur, valeur par defaut 20.
- `ALWAYS_MAIL_TO` : redirection de tous les emails vers une adresse de test, avec destinataire original conserve en metadata.
- `NEXT_PUBLIC_APP_URL`, `APP_URL`, `VERCEL_URL` : base des liens d'action.

## Logs et quota

Chaque tentative cree un log avec :

- type email ;
- destinataire ;
- utilisateur emetteur si present ;
- statut `sent`, `failed` ou `quota_blocked` ;
- provider et id provider si disponible ;
- message d'erreur et metadata.

Le quota est verifie avant envoi pour les emails rattaches a un `senderUserId`.

## Types actuels

- `invitation` : invitation ciblee a rejoindre une table.
- `signup_confirmation` : confirmation apres inscription.
- `session_reminder` : rappel de session envoye par un MJ aux membres.

## Limites actuelles

- Les envois dependent de la configuration d'environnement et des providers externes.
- Le quota est une protection produit simple, pas une solution anti-abus complete.
- Les emails doivent rester non bloquants quand l'action principale peut continuer sans eux.
