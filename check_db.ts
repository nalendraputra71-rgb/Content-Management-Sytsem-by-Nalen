import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, getDocs, where } from "firebase/firestore";
// Need service account or just use the API key if it's public enough? No we need service account.
// Let's use the cloudsql-execute-sql ? No, this is firebase.
