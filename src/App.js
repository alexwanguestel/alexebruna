import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInAnonymously,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithCustomToken
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    onSnapshot,
    Timestamp,
    orderBy,
    updateDoc
} from 'firebase/firestore';
import { setLogLevel } from 'firebase/firestore';

// --- Icon Component (Placeholder SVGs) ---
const Icon = ({ name, className = "w-5 h-5" }) => {
    const iconMap = {
        PlusCircle: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
        Trash2: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>,
        Edit3: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>,
        LogOut: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>,
        ShoppingCart: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
        DollarSign: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
        FileText: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
        Settings: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
        CalendarDays: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
        CheckCircle: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
        XCircle: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
        Eye: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>,
        EyeOff: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-1.274-1.273a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243m-4.242-4.242L12 12M4.938 4.938l14.124 14.124"></path></svg>,
        Home: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
        ListChecks: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>,
        Repeat: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 1l4 4-4 4"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13v2a4 4 0 01-4 4H3"></path></svg>,
        Briefcase: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
        User: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
        Camera: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
        Sun: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8.66-15.66l-.707.707M4.04 19.96l-.707.707M21 12h-1M4 12H3m15.66 8.66l-.707-.707M4.04 4.04l-.707-.707"></path><circle cx="12" cy="12" r="5"></circle></svg>,
        Moon: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>,
        Palette: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.39 0 2.72-.28 3.97-.83A9.026 9.026 0 0019 12c0-4.97-4.03-9-9-9zm7 10c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-1.51.48-2.92 1.3-4.06A8.995 8.995 0 0112 5c3.87 0 7 3.13 7 7z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
        Bell: () => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>,
    };
    const IconComponent = iconMap[name] || (() => <span>{name}</span>);
    return <IconComponent />;
};

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyBCR1d-G6QCA_sPY0a1rXG0wX25-IsdjjA",
    authDomain: "alexebruna.firebaseapp.com",
    projectId: "alexebruna",
    storageBucket: "alexebruna.firebasestorage.app",
    messagingSenderId: "636817058514",
    appId: "1:636817058514:web:9edb0a6178871c0de9db0b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('debug'); 

const appIdGlobal = typeof __app_id !== 'alex-bruna-financeiro';

// --- Theme Context ---
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark'); // 'light' or 'dark'
    const [colorScheme, setColorScheme] = useState('blue'); // 'blue' or 'pink'

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        root.classList.remove('theme-blue', 'theme-pink');
        root.classList.add(`theme-${colorScheme}`);
    }, [theme, colorScheme]);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    const changeColorScheme = (scheme) => setColorScheme(scheme);

    const dynamicStyles = `
        .theme-blue {
            --color-primary: #3b82f6; --color-primary-hover: #2563eb; --color-primary-focus: #1d4ed8;
            --color-primary-text: #eff6ff; --color-primary-light: #93c5fd;
            --color-secondary-bg: #1f2937; --color-secondary-text: #d1d5db;
        }
        .theme-pink {
            --color-primary: #ec4899; --color-primary-hover: #db2777; --color-primary-focus: #be185d;
            --color-primary-text: #fdf2f8; --color-primary-light: #f9a8d4;
            --color-secondary-bg: #1f2937; --color-secondary-text: #d1d5db;
        }
        .bg-primary { background-color: var(--color-primary); }
        .hover\\:bg-primary-hover:hover { background-color: var(--color-primary-hover); }
        .focus\\:ring-primary:focus { --tw-ring-color: var(--color-primary); }
        .text-primary { color: var(--color-primary); }
        .text-primary-light { color: var(--color-primary-light); }
        .border-primary { border-color: var(--color-primary); }

        .dark .bg-slate-900 { background-color: #0f172a; } .dark .bg-slate-800 { background-color: #1e293b; }
        .dark .text-slate-100 { color: #f1f5f9; } .dark .text-slate-300 { color: #cbd5e1; }
        .dark .text-slate-400 { color: #94a3b8; } .dark .border-slate-700 { border-color: #334155; }
    `;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colorScheme, changeColorScheme }}>
            <style>{dynamicStyles}</style>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => useContext(ThemeContext);

// --- Auth Context ---
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user); 
                setUserId(user.uid);
            } else {
                try { 
                    await signInAnonymously(auth); 
                } catch (error) {
                    console.error("Anonymous sign-in failed:", error);
                    setCurrentUser(null); 
                    setUserId(crypto.randomUUID());
                }
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);
    return <AuthContext.Provider value={{ currentUser, userId, authLoading }}>{!authLoading && children}</AuthContext.Provider>;
};
const useAuth = () => useContext(AuthContext);

// --- App ---
function App() {
    const { currentUser, userId, authLoading } = useAuth();
    if (authLoading) return <LoadingScreen message="Carregando autenticação..." />;
    if (!currentUser || !userId) return <AuthScreen />;
    return <MainAppLayout />;
}

// --- Loading Screen ---
const LoadingScreen = ({ message = "Carregando..." }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 dark:bg-slate-900 text-white p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-solid mb-4"></div>
        <p className="text-xl font-semibold">{message}</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Alex & Bruna - Controle e Gestão Financeira</p>
    </div>
);

// --- Auth Screen ---
const AuthScreen = () => {
    const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true); const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); const [showPassword, setShowPassword] = useState(false);
    const { userId: currentGlobalUserId } = useAuth();

    const handleAuth = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            if (isLogin) await signInWithEmailAndPassword(auth, email, password);
            else await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-800 dark:text-white transition-colors duration-300">
            <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold text-center text-primary mb-2">Alex & Bruna</h1>
                <p className="text-center text-slate-600 dark:text-slate-300 mb-8">Controle e Gestão Financeira</p>
                <form onSubmit={handleAuth} className="space-y-6">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary" placeholder="seu@email.com" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label><div className="relative"><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary" placeholder="Sua senha" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">{showPassword ? <Icon name="EyeOff" /> : <Icon name="Eye" />}</button></div></div>
                    {error && <p className="text-sm text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
                    <Button type="submit" disabled={loading} variant="primary" className="w-full !py-3 !text-base">{loading ? (isLogin ? 'Entrando...' : 'Criando conta...') : (isLogin ? 'Entrar' : 'Criar Conta')}</Button>
                </form>
                <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">{isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'} <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-medium text-primary hover:opacity-80">{isLogin ? 'Crie uma agora' : 'Faça login'}</button></p>
                <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">Ou continue com <button onClick={async () => { setLoading(true); try { await signInAnonymously(auth); } catch(e) { setError(e.message); } finally { setLoading(false); }}} className="underline hover:text-primary">acesso anônimo</button>.</p>
            </div>
            <footer className="text-center text-xs text-slate-500 dark:text-slate-600 mt-8">Seu User ID: <span className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">{currentGlobalUserId || 'N/A'}</span></footer>
        </div>
    );
};

// --- Main App Layout ---
const MainAppLayout = () => {
    const [activeView, setActiveView] = useState('dashboard'); const { userId } = useAuth();
    const { theme, toggleTheme, colorScheme, changeColorScheme } = useTheme();
    const handleSignOut = async () => { try { await signOut(auth); } catch (error) { console.error("Error signing out: ", error); }};
    if (!userId) return <LoadingScreen message="Carregando dados do usuário..." />;

    const NavItem = ({ iconName, label, viewName }) => (
        <button onClick={() => setActiveView(viewName)} className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ease-in-out group w-1/5 md:w-full ${activeView === viewName ? 'bg-primary text-white shadow-lg scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary-light'}`} title={label}>
            <Icon name={iconName} className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 sm:mb-1 group-hover:scale-110 transition-transform" />
            <span className={`text-[10px] sm:text-xs font-medium ${activeView === viewName ? 'opacity-100' : 'opacity-70 sm:opacity-100 group-hover:opacity-100'}`}>{label}</span>
        </button>
    );
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
            <nav className="md:w-20 lg:w-56 bg-white dark:bg-slate-800 p-2 md:p-4 shadow-lg flex md:flex-col justify-around md:justify-start space-x-1 md:space-x-0 md:space-y-3 fixed bottom-0 left-0 right-0 md:relative z-50 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-700">
                <div className="hidden md:flex flex-col items-center mb-6 lg:items-start"><h1 className="text-xl lg:text-2xl font-bold text-primary">Alex & Bruna</h1><p className="text-xs text-slate-500 dark:text-slate-400 lg:text-sm">Gestão Financeira</p></div>
                <NavItem iconName="Home" label="Dashboard" viewName="dashboard" /><NavItem iconName="DollarSign" label="Despesas" viewName="expenses" /><NavItem iconName="ListChecks" label="Compras" viewName="shopping" /><NavItem iconName="Repeat" label="Mensais" viewName="monthly" /><NavItem iconName="FileText" label="Relatórios" viewName="reports" /><NavItem iconName="Camera" label="Cupom" viewName="receipt" />
                <div className="hidden md:flex flex-col mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-center lg:justify-start space-x-2"><button onClick={toggleTheme} title="Mudar tema claro/escuro" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">{theme === 'light' ? <Icon name="Moon" /> : <Icon name="Sun" />}</button><button onClick={() => changeColorScheme(colorScheme === 'blue' ? 'pink' : 'blue')} title="Mudar esquema de cores" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"><Icon name="Palette" className={colorScheme === 'pink' ? 'text-pink-500' : 'text-blue-500'}/></button></div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 lg:block hidden truncate" title={userId}>User ID: <span className="font-mono ">{userId.substring(0,10)}...</span></p>
                    <Button onClick={handleSignOut} variant="ghost" className="w-full !justify-center lg:!justify-start !p-2 hover:!bg-red-500/10 dark:hover:!bg-red-500/20 group"><Icon name="LogOut" className="w-5 h-5 lg:mr-2 text-slate-500 dark:text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400" /><span className="hidden lg:inline text-sm text-slate-500 dark:text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400">Sair</span></Button>
                </div>
                <div className="md:hidden flex flex-col items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-400 w-1/5"><button onClick={toggleTheme} title="Mudar tema" className="p-1 mb-0.5">{theme === 'light' ? <Icon name="Moon" className="w-5 h-5"/> : <Icon name="Sun" className="w-5 h-5" />}</button><span className="text-[10px]">Tema</span></div>
                <div className="md:hidden flex flex-col items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-400 w-1/5"><button onClick={() => changeColorScheme(colorScheme === 'blue' ? 'pink' : 'blue')} title="Mudar cor" className="p-1 mb-0.5"><Icon name="Palette" className={`w-5 h-5 ${colorScheme === 'pink' ? 'text-pink-500' : 'text-blue-500'}`}/></button><span className="text-[10px]">Cor</span></div>
                <div className="md:hidden flex flex-col items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-400 w-1/5"><button onClick={handleSignOut} title="Sair" className="p-1 mb-0.5"><Icon name="LogOut" className="w-5 h-5 text-red-500/80"/></button><span className="text-[10px]">Sair</span></div>
            </nav>
            <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto mb-20 md:mb-0">
                {activeView === 'dashboard' && <Dashboard setActiveView={setActiveView} />} {activeView === 'expenses' && <ExpensesView />}
                {activeView === 'shopping' && <ShoppingListView />} {activeView === 'monthly' && <MonthlyExpensesView />}
                {activeView === 'reports' && <ReportsView />} {activeView === 'receipt' && <ReceiptUploadView />}
            </main>
        </div>
    );
};

// --- Modal Component ---
const Modal = ({ isOpen, onClose, title, children, size = 'lg' }) => {
    if (!isOpen) return null;
    const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
    return (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className={`bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-primary">{title}</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"><Icon name="XCircle" className="w-7 h-7" /></button></div>
                <div className="overflow-y-auto flex-grow">{children}</div>
            </div>
        </div>
    );
};

// --- Confirmation Modal ---
const ConfirmationModal = ({ isOpen, onClose, title, message, onConfirm, confirmText = "Confirmar", cancelText = "Cancelar" }) => {
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-slate-600 dark:text-slate-300 mb-6">{message}</p>
            <div className="flex justify-end space-x-3"><Button variant="ghost" onClick={onClose}>{cancelText}</Button><Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Button></div>
        </Modal>
    );
};

// --- Button Component ---
const Button = ({ onClick, children, variant = 'primary', type = 'button', disabled = false, className = '' }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-primary hover:bg-primary-hover text-white focus:ring-primary",
        secondary: "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 focus:ring-slate-500",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        ghost: "bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 focus:ring-slate-500",
    };
    return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

// --- Dashboard ---
const Dashboard = ({ setActiveView }) => {
    const { userId } = useAuth();
    const [summary, setSummary] = useState({ totalExpenses: 0, personal: 0, belz: 0, count: 0 });
    const [recentExpenses, setRecentExpenses] = useState([]); const [upcomingBills, setUpcomingBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return; setLoading(true);
        const expensesCol = collection(db, `artifacts/${appIdGlobal}/users/${userId}/expenses`);
        const expensesQuery = query(expensesCol, orderBy('date', 'desc'));
        const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
            let total = 0, personalTotal = 0, belzTotal = 0; const recents = [];
            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data(); const expenseDate = data.date.toDate(); const today = new Date();
                if (expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear()) {
                    total += data.amount;
                    if (data.category === 'Pessoal') personalTotal += data.amount; if (data.category === 'Belz') belzTotal += data.amount;
                }
                if (recents.length < 5) recents.push({ id: docSnap.id, ...data });
            });
            setSummary({ totalExpenses: total, personal: personalTotal, belz: belzTotal, count: snapshot.size });
            setRecentExpenses(recents);
        }, (error) => console.error("Error fetching dashboard expenses: ", error));

        const recurringQuery = query(expensesCol, where('isRecurring', '==', true), orderBy('dayOfMonthDue', 'asc'));
        const unsubscribeBills = onSnapshot(recurringQuery, (snapshot) => {
            const today = new Date(); const currentDay = today.getDate();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const bills = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
                .map(bill => {
                    let dueDate = new Date(today.getFullYear(), today.getMonth(), bill.dayOfMonthDue);
                    let status = 'upcoming'; let daysRemaining = bill.dayOfMonthDue - currentDay;
                    if (bill.dayOfMonthDue < currentDay) {
                        if (currentDay - bill.dayOfMonthDue > 15 && bill.dayOfMonthDue < 15) {
                             dueDate.setMonth(today.getMonth() + 1); daysRemaining = (daysInMonth - currentDay) + bill.dayOfMonthDue;
                        } else { status = 'past_due'; daysRemaining = bill.dayOfMonthDue - currentDay; }
                    }
                    return {...bill, dueDate, status, daysRemaining};
                })
                .filter(bill => (bill.status === 'upcoming' && bill.daysRemaining <= 7 && bill.daysRemaining >= 0) || (bill.status === 'past_due' && bill.daysRemaining <0 && bill.daysRemaining > -7))
                .sort((a,b) => a.daysRemaining - b.daysRemaining);
            setUpcomingBills(bills.slice(0, 5)); setLoading(false);
        }, (error) => { console.error("Error fetching upcoming bills: ", error); setLoading(false); });
        return () => { unsubscribeExpenses(); unsubscribeBills(); };
    }, [userId]);

    if (loading && !userId) return <LoadingScreen message="Aguardando autenticação..." />;
    if (loading) return <LoadingScreen message="Carregando dashboard..." />;

    const StatCard = ({ title, value, iconName, colorClass = "text-primary", borderClass = "border-primary" }) => (
        <div className={`bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border-l-4 ${borderClass} transition-colors duration-300`}>
            <div className="flex items-center justify-between"><p className="text-sm text-slate-500 dark:text-slate-400">{title}</p><p className="text-2xl font-bold text-slate-700 dark:text-slate-100">{typeof value === 'number' ? `R$ ${value.toFixed(2)}` : value}</p><div className={`p-2 sm:p-3 bg-opacity-10 dark:bg-opacity-20 rounded-full bg-current ${colorClass}`}><Icon name={iconName} className={`w-6 h-6 sm:w-7 sm:h-7 ${colorClass}`} /></div></div>
        </div>
    );
    const getBillStatusColor = (status, daysRemaining) => { if (status === 'past_due') return 'text-red-500 dark:text-red-400'; if (daysRemaining <= 2) return 'text-orange-500 dark:text-orange-400'; return 'text-slate-500 dark:text-slate-400'; };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100">Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <StatCard title="Gastos no Mês" value={summary.totalExpenses} iconName="DollarSign" colorClass="text-red-500 dark:text-red-400" borderClass="border-red-500 dark:border-red-400" />
                <StatCard title="Pessoal (Mês)" value={summary.personal} iconName="User" colorClass="text-green-500 dark:text-green-400" borderClass="border-green-500 dark:border-green-400" />
                <StatCard title="Belz (Mês)" value={summary.belz} iconName="Briefcase" colorClass="text-purple-500 dark:text-purple-400" borderClass="border-purple-500 dark:border-purple-400"/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg transition-colors duration-300">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary">Ações Rápidas</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <Button onClick={() => setActiveView('expenses')} className="w-full !py-2.5 sm:!py-3 !text-sm sm:!text-base"><Icon name="PlusCircle" className="w-4 h-4 sm:w-5 sm:h-5" /> Nova Despesa</Button>
                        <Button onClick={() => setActiveView('shopping')} variant="secondary" className="w-full !py-2.5 sm:!py-3 !text-sm sm:!text-base"><Icon name="ListChecks" className="w-4 h-4 sm:w-5 sm:h-5" /> Lista Compras</Button>
                        <Button onClick={() => setActiveView('monthly')} variant="secondary" className="w-full !py-2.5 sm:!py-3 !text-sm sm:!text-base"><Icon name="Repeat" className="w-4 h-4 sm:w-5 sm:h-5" /> Contas Mensais</Button>
                        <Button onClick={() => setActiveView('receipt')} variant="secondary" className="w-full !py-2.5 sm:!py-3 !text-sm sm:!text-base"><Icon name="Camera" className="w-4 h-4 sm:w-5 sm:h-5" /> Cupom Fiscal</Button>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg transition-colors duration-300">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary">Lembretes de Contas</h3>
                    {upcomingBills.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma conta próxima do vencimento.</p>}
                    <ul className="space-y-2 sm:space-y-3">
                        {upcomingBills.map(bill => (<li key={bill.id} className="flex justify-between items-center p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md"><div><p className="font-medium text-sm sm:text-base text-slate-700 dark:text-slate-200">{bill.name}</p><p className={`text-xs sm:text-sm ${getBillStatusColor(bill.status, bill.daysRemaining)}`}>{bill.status === 'past_due' ? `Venceu dia ${bill.dayOfMonthDue}` : `Vence dia ${bill.dayOfMonthDue}`}{bill.status !== 'past_due' && ` (em ${bill.daysRemaining} dia${bill.daysRemaining !== 1 ? 's' : ''})`}</p></div><p className="font-semibold text-sm sm:text-base text-red-500 dark:text-red-400">R$ {bill.amount.toFixed(2)}</p></li>))}
                    </ul>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg transition-colors duration-300">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary">Despesas Recentes</h3>
                {recentExpenses.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma despesa recente.</p>}
                <ul className="space-y-2 sm:space-y-3">
                    {recentExpenses.map(exp => (<li key={exp.id} className="flex justify-between items-center p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md"><div><p className="font-medium text-sm sm:text-base text-slate-700 dark:text-slate-200">{exp.name}</p><p className="text-xs text-slate-400 dark:text-slate-500">{exp.date instanceof Timestamp ? new Date(exp.date.seconds * 1000).toLocaleDateString('pt-BR') : 'Data inválida'} - {exp.category}</p></div><p className="font-semibold text-sm sm:text-base text-red-500 dark:text-red-400">R$ {exp.amount.toFixed(2)}</p></li>))}
                </ul>
            </div>
        </div>
    );
};

// --- Expense Form ---
const ExpenseForm = ({ currentExpense, onSave, onCancel }) => {
    const [name, setName] = useState(''); const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(''); const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('Pessoal'); const [isRecurring, setIsRecurring] = useState(false);
    const [dayOfMonthDue, setDayOfMonthDue] = useState('');

    useEffect(() => {
        if (currentExpense) {
            setName(currentExpense.name || ''); setDescription(currentExpense.description || '');
            setAmount(currentExpense.amount.toString());
            setDate(currentExpense.date instanceof Timestamp ? currentExpense.date.toDate().toISOString().split('T')[0] : (currentExpense.date || new Date().toISOString().split('T')[0]));
            setCategory(currentExpense.category || 'Pessoal'); setIsRecurring(currentExpense.isRecurring || false);
            setDayOfMonthDue(currentExpense.dayOfMonthDue ? currentExpense.dayOfMonthDue.toString() : '');
        } else {
            setName(''); setDescription(''); setAmount(''); setDate(new Date().toISOString().split('T')[0]);
            setCategory('Pessoal'); setIsRecurring(false); setDayOfMonthDue('');
        }
    }, [currentExpense]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !amount || !date || !category) { alert("Por favor, preencha Nome, Valor, Data e Categoria."); return; }
        if (isRecurring && (!dayOfMonthDue || parseInt(dayOfMonthDue) < 1 || parseInt(dayOfMonthDue) > 31)) { alert("Para despesa recorrente, informe um dia do mês válido (1-31)."); return; }
        const expenseData = { name, description, amount: parseFloat(amount), date: Timestamp.fromDate(new Date(date + "T00:00:00Z")), category, isRecurring, dayOfMonthDue: isRecurring ? parseInt(dayOfMonthDue) : null, updatedAt: Timestamp.now() };
        if (!currentExpense) expenseData.createdAt = Timestamp.now();
        onSave(expenseData);
    };
    const inputClass = "mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label htmlFor="name" className={labelClass}>Nome da Despesa *</label><input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClass} required /></div>
            <div><label htmlFor="amount" className={labelClass}>Valor (R$) *</label><input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" className={inputClass} required placeholder="Ex: 50.75" /></div>
            <div><label htmlFor="date" className={labelClass}>Data *</label><input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} required /></div>
            <div><label htmlFor="category" className={labelClass}>Categoria *</label><select id="category" value={category} onChange={e => setCategory(e.target.value)} className={inputClass} required><option value="Pessoal">Pessoal</option><option value="Belz">Belz (Empresa)</option><option value="Alimentação">Alimentação</option><option value="Transporte">Transporte</option><option value="Moradia">Moradia</option><option value="Lazer">Lazer</option><option value="Saúde">Saúde</option><option value="Educação">Educação</option><option value="Outros">Outros</option></select></div>
            <div><label htmlFor="description" className={labelClass}>Descrição (Opcional)</label><textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} min-h-[60px]`} placeholder="Detalhes adicionais..."></textarea></div>
            <div><label className={`${labelClass} flex items-center cursor-pointer`}><input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 text-primary border-slate-400 dark:border-slate-500 rounded focus:ring-primary mr-2 bg-slate-50 dark:bg-slate-700" />É uma despesa recorrente/mensal?</label></div>
            {isRecurring && (<div><label htmlFor="dayOfMonthDue" className={labelClass}>Dia do Vencimento (1-31) *</label><input type="number" id="dayOfMonthDue" value={dayOfMonthDue} onChange={e => setDayOfMonthDue(e.target.value)} min="1" max="31" className={inputClass} required={isRecurring} placeholder="Ex: 5" /></div>)}
            <div className="flex justify-end space-x-3 pt-4"><Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button><Button type="submit" variant="primary">{currentExpense ? 'Salvar Alterações' : 'Adicionar Despesa'}</Button></div>
        </form>
    );
};

// --- Expenses View ---
const ExpensesView = () => {
    const { userId } = useAuth();
    const [expenses, setExpenses] = useState([]); const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null); const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todos'); const [searchTerm, setSearchTerm] = useState('');
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false); const [expenseToDeleteId, setExpenseToDeleteId] = useState(null);
    const expensesCollectionPath = `artifacts/${appIdGlobal}/users/${userId}/expenses`;

    useEffect(() => {
        if (!userId) return; setLoading(true);
        let q = query(collection(db, expensesCollectionPath), orderBy('date', 'desc'));
        if (filter !== 'Todos') q = query(collection(db, expensesCollectionPath), where('category', '==', filter), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); setLoading(false);
        }, (error) => { console.error("Error fetching expenses: ", error); setLoading(false); });
        return () => unsubscribe();
    }, [userId, filter, expensesCollectionPath]);

    const handleSaveExpense = async (expenseData) => {
        if (!userId) return; try {
            if (currentExpense && currentExpense.id) await updateDoc(doc(db, expensesCollectionPath, currentExpense.id), expenseData);
            else await addDoc(collection(db, expensesCollectionPath), expenseData);
            setIsModalOpen(false); setCurrentExpense(null);
        } catch (error) { console.error("Error saving expense: ", error); }
    };
    const handleEdit = (expense) => { setCurrentExpense(expense); setIsModalOpen(true); };
    const confirmDelete = (id) => { setExpenseToDeleteId(id); setIsConfirmDeleteOpen(true); };
    const handleDelete = async () => {
        if (!userId || !expenseToDeleteId) return; try {
            await deleteDoc(doc(db, expensesCollectionPath, expenseToDeleteId)); setExpenseToDeleteId(null);
        } catch (error) { console.error("Error deleting expense: ", error); }
    };
    const filteredExpenses = expenses.filter(exp => (exp.name && exp.name.toLowerCase().includes(searchTerm.toLowerCase())) || (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase())));

    if (loading && !userId) return <LoadingScreen message="Aguardando autenticação..." />;
    if (loading) return <LoadingScreen message="Carregando despesas..." />;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4"><h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100">Minhas Despesas</h2><Button onClick={() => { setCurrentExpense(null); setIsModalOpen(true); }} variant="primary" className="w-full sm:w-auto !py-2.5"><Icon name="PlusCircle" className="w-5 h-5" /> Adicionar Despesa</Button></div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md"><input type="text" placeholder="Buscar por nome ou descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500" /><select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"><option value="Todos">Todas Categorias</option><option value="Pessoal">Pessoal</option><option value="Belz">Belz (Empresa)</option><option value="Alimentação">Alimentação</option><option value="Transporte">Transporte</option><option value="Moradia">Moradia</option><option value="Lazer">Lazer</option><option value="Saúde">Saúde</option><option value="Educação">Educação</option><option value="Outros">Outros</option></select></div>
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setCurrentExpense(null); }} title={currentExpense ? "Editar Despesa" : "Nova Despesa"}><ExpenseForm currentExpense={currentExpense} onSave={handleSaveExpense} onCancel={() => { setIsModalOpen(false); setCurrentExpense(null); }} /></Modal>
            <ConfirmationModal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirmar Exclusão" message="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita." onConfirm={handleDelete}/>
            {filteredExpenses.length === 0 ? (<div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-md"><Icon name="FileText" className="mx-auto w-12 h-12 sm:w-16 sm:h-16 text-slate-400 dark:text-slate-500 mb-4" /><p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">Nenhuma despesa encontrada.</p>{searchTerm && <p className="text-slate-400 dark:text-slate-500 text-sm">Tente um termo de busca diferente.</p>}{filter !== 'Todos' && !searchTerm && <p className="text-slate-400 dark:text-slate-500 text-sm">Tente alterar o filtro.</p>}</div>) : (<div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-md"><table className="w-full min-w-[640px] text-sm text-left text-slate-600 dark:text-slate-300"><thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50"><tr><th scope="col" className="px-4 py-3 sm:px-6 sm:py-3">Nome</th><th scope="col" className="px-4 py-3 sm:px-6 sm:py-3">Valor</th><th scope="col" className="px-4 py-3 sm:px-6 sm:py-3">Data</th><th scope="col" className="px-4 py-3 sm:px-6 sm:py-3">Categoria</th><th scope="col" className="px-4 py-3 sm:px-6 sm:py-3 text-center">Recorrente</th><th scope="col" className="px-4 py-3 sm:px-6 sm:py-3 text-center">Ações</th></tr></thead><tbody>{filteredExpenses.map(expense => (<tr key={expense.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"><td className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-slate-800 dark:text-slate-100">{expense.name}</td><td className="px-4 py-3 sm:px-6 sm:py-4 text-red-600 dark:text-red-400">R$ {expense.amount.toFixed(2)}</td><td className="px-4 py-3 sm:px-6 sm:py-4">{expense.date instanceof Timestamp ? new Date(expense.date.seconds * 1000).toLocaleDateString('pt-BR') : 'Inválida'}</td><td className="px-4 py-3 sm:px-6 sm:py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${expense.category === 'Pessoal' ? 'bg-green-100 dark:bg-green-600/30 text-green-700 dark:text-green-300' : (expense.category === 'Belz' ? 'bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-600/30 text-slate-700 dark:text-slate-300')}`}>{expense.category}</span></td><td className="px-4 py-3 sm:px-6 sm:py-4 text-center">{expense.isRecurring ? <Icon name="CheckCircle" className="text-green-500 dark:text-green-400 w-5 h-5 mx-auto" /> : <Icon name="XCircle" className="text-slate-400 dark:text-slate-500 w-5 h-5 mx-auto" />}</td><td className="px-4 py-3 sm:px-6 sm:py-4 text-center space-x-2"><button onClick={() => handleEdit(expense)} className="text-primary hover:opacity-70 p-1"><Icon name="Edit3" className="w-4 h-4 sm:w-5 sm:h-5"/></button><button onClick={() => confirmDelete(expense.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"><Icon name="Trash2" className="w-4 h-4 sm:w-5 sm:h-5"/></button></td></tr>))}</tbody></table></div>)}
        </div>
    );
};

// --- Shopping List View ---
const ShoppingListView = () => {
    const { userId } = useAuth();
    const [items, setItems] = useState([]); const [newItemName, setNewItemName] = useState('');
    const [loading, setLoading] = useState(true); const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null); const [isConfirmDeleteCheckedOpen, setIsConfirmDeleteCheckedOpen] = useState(false);
    const shoppingItemsCollectionPath = `artifacts/${appIdGlobal}/users/${userId}/shoppingItems`;

    useEffect(() => {
        if (!userId) return; setLoading(true);
        const q = query(collection(db, shoppingItemsCollectionPath), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); setLoading(false);
        }, (error) => { console.error("Error fetching shopping list: ", error); setLoading(false); });
        return () => unsubscribe();
    }, [userId, shoppingItemsCollectionPath]);

    const handleAddItem = async (e) => {
        e.preventDefault(); if (!userId || !newItemName.trim()) return; try {
            await addDoc(collection(db, shoppingItemsCollectionPath), { name: newItemName.trim(), isChecked: false, createdAt: Timestamp.now() }); setNewItemName('');
        } catch (error) { console.error("Error adding shopping item: ", error); }
    };
    const toggleItemCheck = async (item) => {
        if (!userId) return; try {
            await updateDoc(doc(db, shoppingItemsCollectionPath, item.id), { isChecked: !item.isChecked });
        } catch (error) { console.error("Error updating shopping item: ", error); }
    };
    const confirmDeleteItem = (id) => { setItemToDeleteId(id); setIsConfirmDeleteOpen(true); };
    const handleDeleteItem = async () => {
        if (!userId || !itemToDeleteId) return; try {
            await deleteDoc(doc(db, shoppingItemsCollectionPath, itemToDeleteId)); setItemToDeleteId(null);
        } catch (error) { console.error("Error deleting shopping item: ", error); }
    };
    const confirmDeleteCheckedItems = () => { setIsConfirmDeleteCheckedOpen(true); };
    const handleDeleteCheckedItems = async () => {
        if (!userId) return; const checkedItems = items.filter(item => item.isChecked); try {
            for (const item of checkedItems) await deleteDoc(doc(db, shoppingItemsCollectionPath, item.id));
        } catch (error) { console.error("Error deleting checked items: ", error); }
    };

    if (loading && !userId) return <LoadingScreen message="Aguardando autenticação..." />;
    if (loading) return <LoadingScreen message="Carregando lista de compras..." />;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4"><h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100">Lista de Compras</h2>{items.some(item => item.isChecked) && (<Button onClick={confirmDeleteCheckedItems} variant="danger" className="w-full sm:w-auto !py-2"><Icon name="Trash2" className="w-4 h-4 sm:w-5 sm:h-5" /> Excluir Marcados</Button>)}</div>
            <form onSubmit={handleAddItem} className="flex gap-2 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md"><input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Adicionar item..." className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500" /><Button type="submit" variant="primary" className="!px-3 sm:!px-4 !py-2"><Icon name="PlusCircle" className="w-5 h-5" /> <span className="hidden sm:inline">Adicionar</span></Button></form>
            <ConfirmationModal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirmar Exclusão" message="Excluir este item da lista?" onConfirm={handleDeleteItem}/>
            <ConfirmationModal isOpen={isConfirmDeleteCheckedOpen} onClose={() => setIsConfirmDeleteCheckedOpen(false)} title="Confirmar Exclusão" message="Excluir itens marcados?" onConfirm={handleDeleteCheckedItems}/>
            {items.length === 0 ? (<div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-md"><Icon name="ShoppingCart" className="mx-auto w-12 h-12 sm:w-16 sm:h-16 text-slate-400 dark:text-slate-500 mb-4" /><p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">Sua lista de compras está vazia.</p></div>) : (<ul className="space-y-2 sm:space-y-3 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-md">{items.map(item => (<li key={item.id} className={`flex items-center justify-between p-2.5 sm:p-3 rounded-md transition-colors duration-150 ${item.isChecked ? 'bg-slate-100 dark:bg-slate-700/70' : 'bg-slate-50 dark:bg-slate-700'}`}><label className="flex items-center cursor-pointer flex-grow"><input type="checkbox" checked={item.isChecked} onChange={() => toggleItemCheck(item)} className="h-5 w-5 text-primary border-slate-400 dark:border-slate-500 rounded focus:ring-primary mr-3 bg-transparent" /><span className={`text-sm sm:text-base ${item.isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-100'}`}>{item.name}</span></label><button onClick={() => confirmDeleteItem(item.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1 ml-2"><Icon name="Trash2" className="w-4 h-4 sm:w-5 sm:h-5"/></button></li>))}</ul>)}
        </div>
    );
};

// --- Monthly Expenses View ---
const MonthlyExpensesView = () => {
    const { userId } = useAuth();
    const [monthlyExpenses, setMonthlyExpenses] = useState([]); const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null); const [loading, setLoading] = useState(true);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false); const [expenseToDeleteId, setExpenseToDeleteId] = useState(null);
    const expensesCollectionPath = `artifacts/${appIdGlobal}/users/${userId}/expenses`;

    useEffect(() => {
        if (!userId) return; setLoading(true);
        const q = query(collection(db, expensesCollectionPath), where('isRecurring', '==', true), orderBy('dayOfMonthDue', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMonthlyExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); setLoading(false);
        }, (error) => { console.error("Error fetching monthly expenses: ", error); setLoading(false); });
        return () => unsubscribe();
    }, [userId, expensesCollectionPath]);

    const handleSaveMonthlyExpense = async (expenseData) => {
        if (!userId) return; const dataToSave = { ...expenseData, isRecurring: true, updatedAt: Timestamp.now() };
        if (!dataToSave.dayOfMonthDue) { alert("Informe o dia do vencimento."); return; }
        try {
            if (currentExpense && currentExpense.id) await updateDoc(doc(db, expensesCollectionPath, currentExpense.id), dataToSave);
            else { dataToSave.createdAt = Timestamp.now(); await addDoc(collection(db, expensesCollectionPath), dataToSave); }
            setIsModalOpen(false); setCurrentExpense(null);
        } catch (error) { console.error("Error saving monthly expense: ", error); }
    };
    const handleEdit = (expense) => { setCurrentExpense(expense); setIsModalOpen(true); };
    const confirmDelete = (id) => { setExpenseToDeleteId(id); setIsConfirmDeleteOpen(true); };
    const handleDelete = async () => {
        if (!userId || !expenseToDeleteId) return; try {
            await deleteDoc(doc(db, expensesCollectionPath, expenseToDeleteId)); setExpenseToDeleteId(null);
        } catch (error) { console.error("Error deleting monthly expense: ", error); }
    };

    if (loading && !userId) return <LoadingScreen message="Aguardando autenticação..." />;
    if (loading) return <LoadingScreen message="Carregando despesas mensais..." />;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4"><h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100">Despesas Mensais</h2><Button onClick={() => { setCurrentExpense({isRecurring: true}); setIsModalOpen(true); }} variant="primary" className="w-full sm:w-auto !py-2.5"><Icon name="PlusCircle" className="w-5 h-5" /> Adicionar Despesa Mensal</Button></div>
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setCurrentExpense(null); }} title={currentExpense && currentExpense.id ? "Editar Despesa Mensal" : "Nova Despesa Mensal"}><ExpenseForm currentExpense={currentExpense} onSave={handleSaveMonthlyExpense} onCancel={() => { setIsModalOpen(false); setCurrentExpense(null); }} /></Modal>
            <ConfirmationModal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirmar Exclusão" message="Excluir esta despesa mensal?" onConfirm={handleDelete}/>
            {monthlyExpenses.length === 0 ? (<div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-md"><Icon name="Repeat" className="mx-auto w-12 h-12 sm:w-16 sm:h-16 text-slate-400 dark:text-slate-500 mb-4" /><p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">Nenhuma despesa mensal cadastrada.</p></div>) : (<div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-md"><table className="w-full min-w-[640px] text-sm text-left text-slate-600 dark:text-slate-300"><thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50"><tr><th scope="col" className="px-4 py-3 sm:px-6 sm:py-3">Nome</th><th scope="col" className="px-4 py-3 sm:px-6 sm:py-3">Valor</th><th scope="col" className="px-4 py-3 sm:px-6 sm:py-3 text-center">Dia Venc.</th><th scope="col" className="px-4 py-3 sm:px-6 sm:py-3">Categoria</th><th scope="col" className="px-4 py-3 sm:px-6 sm:py-3 text-center">Ações</th></tr></thead><tbody>{monthlyExpenses.map(expense => (<tr key={expense.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"><td className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-slate-800 dark:text-slate-100">{expense.name}</td><td className="px-4 py-3 sm:px-6 sm:py-4 text-red-600 dark:text-red-400">R$ {expense.amount.toFixed(2)}</td><td className="px-4 py-3 sm:px-6 sm:py-4 text-center">{expense.dayOfMonthDue || 'N/A'}</td><td className="px-4 py-3 sm:px-6 sm:py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${expense.category === 'Pessoal' ? 'bg-green-100 dark:bg-green-600/30 text-green-700 dark:text-green-300' : (expense.category === 'Belz' ? 'bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-600/30 text-slate-700 dark:text-slate-300')}`}>{expense.category}</span></td><td className="px-4 py-3 sm:px-6 sm:py-4 text-center space-x-2"><button onClick={() => handleEdit(expense)} className="text-primary hover:opacity-70 p-1"><Icon name="Edit3" className="w-4 h-4 sm:w-5 sm:h-5"/></button><button onClick={() => confirmDelete(expense.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"><Icon name="Trash2" className="w-4 h-4 sm:w-5 sm:h-5"/></button></td></tr>))}</tbody></table></div>)}
        </div>
    );
};

// --- Reports View ---
const ReportsView = () => {
    const { userId } = useAuth();
    const [reportData, setReportData] = useState(null); const [loading, setLoading] = useState(true);
    const [monthOffset, setMonthOffset] = useState(0);

    const calculateReportData = useCallback((expenses, targetMonth, targetYear) => {
        let total = 0; const byCategory = {}; let count = 0;
        expenses.forEach(exp => {
            const expenseDate = exp.date.toDate();
            if (expenseDate.getMonth() === targetMonth && expenseDate.getFullYear() === targetYear) {
                total += exp.amount; if (byCategory[exp.category] === undefined) byCategory[exp.category] = 0;
                byCategory[exp.category] += exp.amount; count++;
            }
        }); return { totalExpenses: total, expensesByCategory: byCategory, count };
    }, []);
    
    useEffect(() => {
        if (!userId) return; setLoading(true);
        const targetDate = new Date(); targetDate.setMonth(targetDate.getMonth() + monthOffset);
        const targetMonth = targetDate.getMonth(); const targetYear = targetDate.getFullYear();
        const firstDayOfMonth = Timestamp.fromDate(new Date(targetYear, targetMonth, 1));
        const lastDayOfMonth = Timestamp.fromDate(new Date(targetYear, targetMonth + 1, 0, 23, 59, 59));
        const expensesCol = collection(db, `artifacts/${appIdGlobal}/users/${userId}/expenses`);
        const q = query(expensesCol, where('date', '>=', firstDayOfMonth), where('date', '<=', lastDayOfMonth));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const expenses = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            const currentMonthData = calculateReportData(expenses, targetMonth, targetYear);
            setReportData({ ...currentMonthData, periodLabel: targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) });
            setLoading(false);
        }, (error) => { console.error("Error fetching report data: ", error); setLoading(false); });
        return () => unsubscribe();
    }, [userId, monthOffset, calculateReportData]);

    if (loading && !userId) return <LoadingScreen message="Aguardando autenticação..." />;
    if (loading) return <LoadingScreen message="Gerando relatório..." />;
    if (!reportData) return <p className="text-slate-500 dark:text-slate-400">Não foi possível gerar o relatório.</p>;

    const ReportCard = ({ title, value, subValue, iconName, colorClass = "text-primary", borderClass = "border-primary" }) => (
         <div className={`bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border-l-4 ${borderClass} transition-colors duration-300`}><div className="flex items-center justify-between mb-2"><h3 className={`text-base sm:text-lg font-semibold ${colorClass}`}>{title}</h3><Icon name={iconName} className={`w-7 h-7 sm:w-8 sm:h-8 ${colorClass} opacity-70`} /></div><p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">R$ {value.toFixed(2)}</p>{subValue && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{subValue}</p>}</div>
    );
    const sortedCategories = Object.entries(reportData.expensesByCategory).sort(([,a],[,b]) => b-a);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3"><h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100">Relatório de Despesas</h2><div className="flex items-center gap-2"><Button variant="secondary" onClick={() => setMonthOffset(monthOffset - 1)} className="!px-3 !py-1.5 text-sm">&lt; Anterior</Button><span className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 w-32 text-center">{reportData.periodLabel}</span><Button variant="secondary" onClick={() => setMonthOffset(monthOffset + 1)} disabled={monthOffset === 0} className="!px-3 !py-1.5 text-sm">Próximo &gt;</Button></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"><ReportCard title="Total Gasto no Mês" value={reportData.totalExpenses} subValue={`${reportData.count} transações`} iconName="DollarSign" colorClass="text-red-500 dark:text-red-400" borderClass="border-red-500 dark:border-red-400" /><ReportCard title="Média por Transação" value={reportData.count > 0 ? reportData.totalExpenses / reportData.count : 0} iconName="DollarSign" colorClass="text-blue-500 dark:text-blue-400" borderClass="border-blue-500 dark:border-blue-400" /></div>
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg mt-4 sm:mt-6"><h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary">Gastos por Categoria</h3>{sortedCategories.length === 0 ? (<p className="text-slate-500 dark:text-slate-400">Nenhuma despesa neste mês.</p>) : (<ul className="space-y-3">{sortedCategories.map(([category, amount]) => (<li key={category} className="flex justify-between items-center"><span className="text-sm sm:text-base text-slate-700 dark:text-slate-200">{category}</span><span className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">R$ {amount.toFixed(2)}</span></li>))}</ul>)}<div className="mt-6 h-40 sm:h-64 bg-slate-50 dark:bg-slate-700/50 rounded-md flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">(Em breve: Gráfico)</div></div>
        </div>
    );
};

// --- Receipt Upload View (Aprimorado) ---
const ReceiptUploadView = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [parsedItems, setParsedItems] = useState([]);
    const { userId } = useAuth();
    const appId = appIdGlobal; // Using the global appId

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 4 * 1024 * 1024) {
                setError("A imagem é muito grande. Por favor, use uma imagem menor que 4MB.");
                setImageFile(null); setImageUrl(''); return;
            }
            setImageFile(file); setImageUrl(URL.createObjectURL(file));
            setExtractedText(''); setParsedItems([]); setError('');
        }
    };

    const parseExtractedTextToItems = (text) => {
        console.log("Texto recebido para parse:", text); // Log para depuração
        const lines = text.split('\n');
        const items = [];
        // Regex para capturar: NOME_DO_ITEM (espaço) R$ PRECO
        // Captura: (1: Nome do item), (2: Valor completo R$ X.XX), (3: Valor numérico X.XX ou X,XX)
        const itemRegex = /^(.*?)\s+(R\$\s*(\d+([,.]\d{2})?))\s*$/i;

        lines.forEach((line, index) => {
            line = line.trim();
            if (!line) return;

            const match = line.match(itemRegex);

            if (match) {
                let name = match[1].trim();
                const priceStr = match[3].replace(',', '.').trim(); // Pega o grupo do valor numérico
                const price = parseFloat(priceStr);

                // Limpeza adicional do nome (pode ser ajustada conforme necessário)
                name = name.replace(/\s*\b(UN|UND|CX|KG|L|G|ML|PCT|BDJ|GR|UNID)\b.*$/i, '').trim(); // Remove unidades comuns e texto após elas
                name = name.replace(/^(COD|CÓD|PROD|ITEM)\s*\.?\s*\d*\s*-?\s*/i, '').trim(); // Remove códigos e prefixos de item
                name = name.replace(/\s+[A-Z0-9]{10,}/, '').trim(); // Remove códigos de barras longos no final do nome
                name = name.replace(/\s*\*\s*$/, '').trim(); // Remove asteriscos no final
                name = name.replace(/\s*([0-9]+X|X[0-9]+)\s*$/, '').trim(); // Remove "2X" ou "X2" no final

                if (name && name.length > 1 && price > 0) { // Adicionado name.length > 1 para evitar nomes vazios ou muito curtos
                    items.push({ 
                        id: `parsed-${index}-${Date.now()}`, 
                        name: name || "Item não identificado",
                        amount: price, 
                        category: 'Alimentação' // Categoria padrão, ajustável no modal
                    });
                }
            }
        });
        console.log("Itens parseados:", items); // Log para depuração
        return items;
    };

    const handleProcessReceipt = async () => {
        if (!imageFile) { setError("Por favor, selecione uma imagem do cupom."); return; }
        setIsLoading(true); setError(''); setExtractedText(''); setParsedItems([]);

        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = async () => {
            const base64ImageData = reader.result.split(',')[1]; 
            const prompt = `Analise este cupom fiscal. Para cada item listado, extraia:
1. O nome completo do produto.
2. O valor TOTAL final do item (considerando a quantidade. Por exemplo, se forem '2 UN X PRODUTO Y R$ 10,00', o valor a ser extraído é 10,00, assumindo que este já é o total para as 2 unidades. Se o cupom mostrar 'PRODUTO Z QTD: 3 VL.UNIT: R$ 5,00 VL.TOTAL: R$ 15,00', extraia 15,00).

Formato desejado para cada item: NOME_COMPLETO_DO_PRODUTO R$ PREÇO_TOTAL_DO_ITEM_NUMERICO_COM_DECIMAIS
Exemplos de saída esperada:
ARROZ AGULHINHA T1 5KG R$ 23.99
REFRIGERANTE COLA 2L (PACK C/2) R$ 15.98
SABAO EM PO CX 1KG R$ 12.50

Liste apenas os itens e seus preços totais, um por linha.
Não inclua totais gerais do cupom, subtotais gerais, descontos gerais, impostos, informações do estabelecimento, data, hora, CNPJ, COO, etc. Apenas os produtos e seus respectivos valores totais de item.
Se não conseguir identificar claramente um item ou seu preço total, omita-o da lista.`;
            
            const payload = {
                contents: [{ role: "user", parts: [ { text: prompt }, { inlineData: { mimeType: imageFile.type, data: base64ImageData } } ] }],
                generationConfig: { temperature: 0.2 }
            };
            const apiKey = ""; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) { const errorData = await response.json(); throw new Error(`API Error: ${response.status} ${errorData?.error?.message || response.statusText}`); }
                const result = await response.json();
                
                if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0].text) {
                    const text = result.candidates[0].content.parts[0].text;
                    setExtractedText(text);
                    const items = parseExtractedTextToItems(text);
                    setParsedItems(items);

                    if (items.length > 0) {
                        setIsModalOpen(true); setError('');
                    } else {
                        if (text && text.trim().length > 0) {
                            setError("O texto do cupom foi extraído (veja abaixo), mas não foi possível formatar os itens automaticamente. Por favor, adicione as despesas manualmente.");
                        } else {
                            setError("Não foi possível extrair texto do cupom. Tente uma imagem com melhor qualidade ou adicione as despesas manualmente.");
                        }
                    }
                } else { throw new Error("Resposta da API em formato inesperado ou sem texto extraído."); }
            } catch (err) {
                console.error("Erro ao processar cupom:", err);
                setError(`Falha no processamento: ${err.message}`);
                setExtractedText("Falha ao obter dados do cupom.");
            } finally { setIsLoading(false); }
        };
        reader.onerror = () => { setError("Erro ao ler o arquivo da imagem."); setIsLoading(false); };
    };
    
    const handleItemChangeInModal = (id, field, value) => {
        setParsedItems(prevItems => prevItems.map(item => item.id === id ? { ...item, [field]: (field === 'amount' ? parseFloat(value) || 0 : value) } : item ));
    };
    const handleRemoveItemFromModal = (id) => { setParsedItems(prevItems => prevItems.filter(item => item.id !== id)); };

    const handleAddItemsToExpenses = async () => {
        if (!userId || parsedItems.length === 0) return;
        const expensesCollectionPath = `artifacts/${appId}/users/${userId}/expenses`;
        const todayDate = new Date().toISOString().split('T')[0];

        try {
            for (const item of parsedItems) {
                if (item.name && item.amount > 0) {
                    await addDoc(collection(db, expensesCollectionPath), {
                        name: item.name, amount: item.amount, category: item.category || 'Alimentação',
                        date: Timestamp.fromDate(new Date(todayDate + "T00:00:00Z")),
                        description: "Importado do cupom fiscal", isRecurring: false, dayOfMonthDue: null,
                        createdAt: Timestamp.now(), updatedAt: Timestamp.now()
                    });
                }
            }
            setIsModalOpen(false); setParsedItems([]); setImageFile(null); setImageUrl(''); setExtractedText('');
            alert(`${parsedItems.length} item(s) adicionado(s) às despesas!`); 
        } catch (error) { console.error("Erro ao adicionar itens:", error); setError("Erro ao salvar despesas do cupom."); }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100">Adicionar Despesa com Cupom Fiscal</h2>
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg space-y-4">
                <div><label htmlFor="receipt-upload" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione a imagem do cupom (PNG, JPG, WebP - max 4MB):</label><input type="file" id="receipt-upload" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"/></div>
                {imageUrl && (<div className="mt-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2"><p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Pré-visualização:</p><img src={imageUrl} alt="Pré-visualização do Cupom" className="max-w-full h-auto max-h-60 sm:max-h-80 rounded-md mx-auto shadow-md object-contain" /></div>)}
                {error && <p className="text-sm text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
                <Button onClick={handleProcessReceipt} disabled={!imageFile || isLoading} className="w-full !py-2.5 sm:!py-3 !text-base">{isLoading ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> Processando...</>) : (<><Icon name="Settings" className="w-5 h-5" /> Processar Cupom</>)}</Button>
                {extractedText && !isLoading && (<div className="mt-4 sm:mt-6"><h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">Texto Extraído:</h3><pre className="bg-slate-50 dark:bg-slate-700 p-3 sm:p-4 rounded-md text-xs sm:text-sm text-slate-600 dark:text-slate-200 whitespace-pre-wrap overflow-x-auto max-h-60 sm:max-h-96">{extractedText}</pre></div>)}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirmar Itens do Cupom" size="xl">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Revise os itens extraídos. Edite ou remova antes de adicionar às despesas.</p>
                {parsedItems.length === 0 && <p className="text-slate-500 dark:text-slate-400">Nenhum item para confirmar.</p>}
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                    {parsedItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_150px_auto] gap-2 items-center p-2 bg-slate-50 dark:bg-slate-700 rounded">
                            <input type="text" value={item.name} onChange={(e) => handleItemChangeInModal(item.id, 'name', e.target.value)} placeholder="Nome do item" className="text-sm px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 w-full"/>
                            <input type="number" value={item.amount} onChange={(e) => handleItemChangeInModal(item.id, 'amount', e.target.value)} placeholder="Valor" step="0.01" className="text-sm px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 w-full"/>
                            <select value={item.category} onChange={(e) => handleItemChangeInModal(item.id, 'category', e.target.value)} className="text-sm px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 w-full"><option value="Alimentação">Alimentação</option><option value="Pessoal">Pessoal</option><option value="Belz">Belz (Empresa)</option><option value="Transporte">Transporte</option><option value="Moradia">Moradia</option><option value="Lazer">Lazer</option><option value="Saúde">Saúde</option><option value="Educação">Educação</option><option value="Outros">Outros</option></select>
                            <Button variant="danger" onClick={() => handleRemoveItemFromModal(item.id)} className="!p-1.5 sm:!p-2"><Icon name="Trash2" className="w-4 h-4"/></Button>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700"><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button variant="primary" onClick={handleAddItemsToExpenses} disabled={parsedItems.length === 0}>Adicionar {parsedItems.length} Itens</Button></div>
            </Modal>
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg mt-4 sm:mt-6"><h3 className="text-lg sm:text-xl font-semibold mb-2 text-amber-500 dark:text-amber-400">Como funciona (e limitações):</h3><ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 text-sm"><li>A imagem do cupom é enviada para uma IA (Gemini) para extrair o texto.</li><li>A qualidade da extração depende da foto. Cupons amassados ou com caligrafia podem falhar.</li><li>Após a extração, revise e edite os itens antes de salvá-los como despesas.</li><li>Funcionalidade experimental, pode não identificar todos os itens/preços corretamente.</li></ul></div>
        </div>
    );
};

// --- Root Component ---
const Root = () => ( <ThemeProvider><AuthProvider><App /></AuthProvider></ThemeProvider> );
export default Root;
