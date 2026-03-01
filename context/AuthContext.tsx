import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    User, 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    setDoc, 
    serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../src/config/firebase';

type UserRole = 'admin' | 'customer' | null;

interface AuthContextType {
    user: User | null;
    role: UserRole;
    shopId: string | null;
    loading: boolean;
    loginCustomer: () => Promise<void>;
    createAdminUserDoc: (user: User, shopName: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [shopId, setShopId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setRole(data.role as UserRole);
                        setShopId(data.shopId || null);
                    } else {
                        setRole(null);
                        setShopId(null);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setRole(null);
                }
            } else {
                setRole(null);
                setShopId(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginCustomer = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const currentUser = result.user;
            
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const data = userDoc.data();
                // Do NOT overwrite admin role or shopId if an admin logs in here
                if (data.role !== 'admin') {
                    await setDoc(userDocRef, { 
                        role: 'customer', 
                        lastLogin: serverTimestamp() 
                    }, { merge: true });
                    setRole('customer');
                } else {
                    await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
                }
            } else {
                // New customer
                await setDoc(userDocRef, { 
                    role: 'customer', 
                    lastLogin: serverTimestamp() 
                }, { merge: true });
                setRole('customer');
            }
        } catch (error) {
            console.error("Customer login failed", error);
            throw error;
        }
    };

    const createAdminUserDoc = async (currentUser: User, shopName: string) => {
        const generatedShopId = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        await setDoc(userDocRef, {
            email: currentUser.email,
            role: 'admin',
            shopId: generatedShopId,
            createdAt: serverTimestamp()
        });
        
        setRole('admin');
        setShopId(generatedShopId);
    };

    const logout = () => firebaseSignOut(auth);

    return (
        <AuthContext.Provider value={{ user, role, shopId, loading, loginCustomer, createAdminUserDoc, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};