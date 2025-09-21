# Premium Font Installation Guide for Naz's Collection

## 🎨 Font Pairing Selected
**Playfair Display + Inter** - Perfect for luxury fashion brands

- **Playfair Display**: Elegant serif for headings, brand name, banners
- **Inter**: Clean modern sans for body text, buttons, descriptions

## 📥 Step 1: Download Font Files

### Download from Google Fonts:

**Playfair Display**: https://fonts.google.com/specimen/Playfair+Display
- Download these weights: Regular (400), Medium (500), SemiBold (600), Bold (700)

**Inter**: https://fonts.google.com/specimen/Inter  
- Download these weights: Regular (400), Medium (500), SemiBold (600), Bold (700)

### Required Files:
```
src/assets/fonts/
├── PlayfairDisplay-Regular.ttf
├── PlayfairDisplay-Medium.ttf
├── PlayfairDisplay-SemiBold.ttf
├── PlayfairDisplay-Bold.ttf
├── Inter-Regular.ttf
├── Inter-Medium.ttf
├── Inter-SemiBold.ttf
└── Inter-Bold.ttf
```

## 🔧 Step 2: Installation Commands

1. **Create fonts directory** (if not exists):
   ```bash
   mkdir -p src/assets/fonts
   ```

2. **Place all .ttf files** in `src/assets/fonts/`

3. **Link fonts to React Native**:
   ```bash
   npx react-native-asset
   ```

4. **Rebuild the app**:
   ```bash
   # For Android
   npx react-native run-android
   
   # Clean build if needed
   cd android && ./gradlew clean && cd ..
   npx react-native run-android
   ```

## ✅ Step 3: Verify Installation

The fonts are already integrated in your code:
- Brand name: `Fonts.families.heading` (PlayfairDisplay)
- Section titles: `Fonts.families.heading` (PlayfairDisplay)  
- Body text: `Fonts.families.body` (Inter)
- Product names/prices: `Fonts.families.body` (Inter)

## 🎯 Where Fonts Are Applied

### HomeScreen:
- ✅ Brand name "N&N Naz's Collection" → PlayfairDisplay
- ✅ Section titles → PlayfairDisplay
- ✅ Banner titles → PlayfairDisplay
- ✅ Banner subtitles → Inter

### ProductCard:
- ✅ Product names → Inter
- ✅ Categories → Inter
- ✅ Prices → Inter

## 🚨 Troubleshooting

**If fonts don't appear:**
1. Ensure exact file names match (case-sensitive)
2. Run `npx react-native-asset` again
3. Clean and rebuild: `cd android && ./gradlew clean`
4. Check that files are in `android/app/src/main/assets/fonts/`

**Font not loading:**
- Verify font family names in code match exactly: `PlayfairDisplay`, `Inter`
- Check React Native logs for font loading errors

## 🎨 Font Usage Reference

```javascript
// In your styles
{
  fontFamily: Fonts.families.heading,  // PlayfairDisplay
  fontFamily: Fonts.families.body,     // Inter
  fontFamily: Fonts.families.accent,   // PlayfairDisplay
}
```

After installation, your app will have a premium, luxury fashion brand appearance! 🌟
