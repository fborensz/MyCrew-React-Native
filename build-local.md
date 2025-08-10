# MyCrew - Build Local .ipa pour AltStore

## Option 1: EAS Build sans certificat Apple

```bash
# Build pour distribution interne (pas besoin de certificats)
eas build --platform ios --profile preview --local

# Alternative: Build avec auto-signing
eas build --platform ios --profile development --local
```

## Option 2: Export Metro Bundle + IPA Tools

```bash
# 1. Exporter le bundle
npx expo export --platform ios

# 2. Utiliser ios-deploy ou similaire pour créer l'IPA
# (nécessite macOS ou VM macOS)
```

## Option 3: Utiliser AppCraft/IPAPatch

1. Utiliser un service comme AppCraft ou IPAPatch
2. Upload du projet exporté
3. Génération de l'IPA sans certificats

## Option 4: VM macOS + Xcode

Si tu veux vraiment faire tout en local :
1. VM macOS sur ton PC Windows
2. Xcode gratuit (sans compte developer)
3. Build local avec certificat auto-signé

## Recommandation

Pour AltStore, l'**Option 1** avec EAS local est la plus simple.
Sinon, utilise un service en ligne comme AppCraft.