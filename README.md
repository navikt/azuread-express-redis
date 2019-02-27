Azure ad med express-session og redis i nodejs
====================

Dette er et repo med pseudo kode for azure ad autentisering med express-session og redis tatt fra [dsop-kontroll-frontend](https://github.com/navikt/dsop-kontroll-frontend). Målet med repoet er å prøve å gi et eksempel på hvordan azure ad autentisering kan bli tatt i bruk frontend. Jeg har forsøkt å kommentere viktige poeng, og lagt til tall jeg referer til i readme.

For mer detaljer rundt azure ad autentisering kikk på https://github.com/navikt/navs-aad-authorization-flow.

Disclaimers: 
1. dsop-kontroll-frontend er en internapp og det er derfor kun testet med pålogging av internansatte. Det er ikke sikkert dette er riktig vei å gå for en selvbetjeningsapp. 
2. Dette er ikke kjørbar kode :) 

# What's what?

## Redis
Redis er satt opp i hvert miljø for react appen og henter passord fra vault. Les [secure-redis](https://github.com/navikt/baseimages/tree/master/secure-redis) for mer informasjon.

## server.js
1. Her kobler vi på redis med session(express-session) som parameter. Her settes det opp masse avhengigheter slik at session informasjon automagisk legges på requestene.
2. Vi forteller express at hver request skal inneholde session informasjon. Det er også her vi sier at express-session skal bruke redis som storage. For utvikling kan man gjerne fjerne `store` slik at default(in memory) db blir brukt. 
3. Enkelt eksempel på hvordan legge til proxy for kall som skal til backend hvor man ønsker å hekte på et accessToken. Mer om det i proxy.js. 
4. Her defineres endepunkter som gjelder autentisering. 
* Login kommer man til om man prøver å logge inn og her redirecter passport oss til oppgitt url
* callback kalles når brukeren har forsøkt å logge seg inn og videre her er det passport og express-session som tar vare på sesjonen. 
* logout kalles når brukeren ønsker å logge seg ut.
5. Tilgengeliggjør appen/html og sørg for å kalle `ensureAuthenticated()` som sjekker om sesjonen er autentisert. 

## passport.js og passportConfig.js
Definerer oppsettet av passport og setter session felter.

## authenticate.js
En rekke hjelpefunksjoner som støtter opp under passport sin autentisering.

## token.js
Funksjoner for validering og henting av accessToken på bruker.

## getAccessToken.js
Enkel funksjon som henter nytt accessToken basert på config og brukers refreshToken. 

## proxy.js
Inneholder funksjoner som håndterer proxy for kall som går fra en frontend app til backend og som ønsker accessToken med på requesten. Ved å gjøre dette ser aldri clienten noen tokens.

