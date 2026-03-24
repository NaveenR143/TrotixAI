// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAro0mrDXd90CXXzM3UD1mjAxspSI9mplk",
  authDomain: "oilgasgpt-18efd.firebaseapp.com",
  projectId: "oilgasgpt-18efd",
  storageBucket: "oilgasgpt-18efd.firebasestorage.app",
  messagingSenderId: "652160351087",
  appId: "1:652160351087:web:895769b244dc4cac06069a",
  measurementId: "G-4XB3LSKRVN"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider("microsoft.com");

export { auth, googleProvider, microsoftProvider };