import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Creamy off-white
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
    color: '#1A1A1A',
    letterSpacing: -1, // Tight tracking
    fontFamily: Platform.OS === 'ios' ? 'Arial Black' : 'Roboto',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#888',
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
    color: '#1A1A1A',
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 2, // Sharp corners as per design
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 2,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
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
    backgroundColor: '#BF5B30', // Burnt orange / Terracotta
    paddingVertical: 18,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#BF5B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // --- Error Styles ---
  errorContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FEE',
    borderWidth: 1,
    borderColor: '#FCC',
    borderRadius: 4,
  },
  errorText: {
    color: '#C33',
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
    backgroundColor: '#E0E0E0',
    marginBottom: 30,
  },
  registerRow: {
    flexDirection: 'row',
    marginBottom: 60,
  },
  registerText: {
    color: '#888',
    fontSize: 14,
  },
  registerLink: {
    color: '#5A7D5A', // Sage/Forest Green
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
    backgroundColor: '#E0E0E0',
  },
});

export default styles