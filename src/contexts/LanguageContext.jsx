import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    const translations = {
      en: {
        'Welcome Back': 'Welcome Back',
        'Login to the Document Portal': 'Login to the Document Portal',
        'Email Address': 'Email Address',
        'Password': 'Password',
        'Sign In': 'Sign In',
        'Authenticating...': 'Authenticating...',
        'Don\'t have an account?': 'Don\'t have an account?',
        'Register here': 'Register here',
        'Create Account': 'Create Account',
        'Register for the Document Portal': 'Register for the Document Portal',
        'Full Name': 'Full Name',
        'Phone Number': 'Phone Number',
        'Role': 'Role',
        'Parent': 'Parent',
        'Past Student': 'Past Student',
        'Date of Birth': 'Date of Birth',
        'Register': 'Register',
        'Creating Account...': 'Creating Account...',
        'Already have an account?': 'Already have an account?',
        'Hello': 'Hello',
        'Identity Verification Required': 'Identity Verification Required',
        'Your requests are paused. Please upload your ID/SSN card to unlock processing.': 'Your requests are paused. Please upload your ID/SSN card to unlock processing.',
        'Upload ID': 'Upload ID',
        'Uploading...': 'Uploading...',
        'Must be at least 18 years old.': 'Must be at least 18 years old.',
        'Logout': 'Logout',
        'Bishop Martin Portal': 'Bishop Martin Portal'
      },
      es: {
        'Welcome Back': 'Bienvenido de nuevo',
        'Login to the Document Portal': 'Inicie sesión en el Portal de Documentos',
        'Email Address': 'Correo Electrónico',
        'Password': 'Contraseña',
        'Sign In': 'Iniciar Sesión',
        'Authenticating...': 'Autenticando...',
        'Don\'t have an account?': '¿No tienes una cuenta?',
        'Register here': 'Regístrate aquí',
        'Create Account': 'Crear Cuenta',
        'Register for the Document Portal': 'Regístrese para el Portal de Documentos',
        'Full Name': 'Nombre Completo',
        'Phone Number': 'Número de Teléfono',
        'Role': 'Rol',
        'Parent': 'Padre',
        'Past Student': 'Antiguo Alumno',
        'Date of Birth': 'Fecha de Nacimiento',
        'Register': 'Registrarse',
        'Creating Account...': 'Creando Cuenta...',
        'Already have an account?': '¿Ya tienes una cuenta?',
        'Hello': 'Hola',
        'Identity Verification Required': 'Verificación de Identidad Requerida',
        'Your requests are paused. Please upload your ID/SSN card to unlock processing.': 'Sus solicitudes están en pausa. Por favor, suba su tarjeta de ID/SSN para desbloquear el procesamiento.',
        'Upload ID': 'Subir ID',
        'Uploading...': 'Subiendo...',
        'Must be at least 18 years old.': 'Debe tener al menos 18 años.',
        'Logout': 'Cerrar Sesión',
        'Bishop Martin Portal': 'Portal Bishop Martin'
      }
    };
    return translations[language]?.[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
