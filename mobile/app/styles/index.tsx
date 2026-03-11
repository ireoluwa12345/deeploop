import { StyleSheet } from "react-native";

export const Colors = {
  background: '#F9F9F9', // Creamy off-white (Global app background)
  surface: '#FFFFFF',
  primary: '#BF5B30', // Burnt orange / Terracotta
  secondary: '#5A7D5A', // Sage/Forest Green
  text: '#1A1A1A',
  textSecondary: '#888888',
  border: '#E0E0E0',
  error: '#CC3333',
  errorBackground: '#FFEEEE',
};

const FONT_FAMILY = 'JetBrainsMono_400Regular';

export const Fonts = {
  app: FONT_FAMILY,
  serif: FONT_FAMILY,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  // --- Header Styles ---
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 40,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '900', // Extra bold
    color: Colors.text,
    letterSpacing: -1, // Tight tracking
    fontFamily: FONT_FAMILY,
  },
  appSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 4, // Wide tracking
    marginTop: 8,
    fontWeight: '500',
  },

  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 2, // Sharp corners as per design
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 2,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 14,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 30,
    marginTop: -10,
  },
  forgotText: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // --- Error Styles ---
  errorContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: Colors.errorBackground,
    borderWidth: 1,
    borderColor: '#FCC',
    borderRadius: 4,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  // --- Footer Styles ---
  footerContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 30,
  },
  registerRow: {
    flexDirection: 'row',
    marginBottom: 60,
  },
  registerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.secondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#D69E8E', // Light Terracotta
  },
  dotInactive: {
    backgroundColor: Colors.border,
  },
});

export default styles