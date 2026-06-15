import { db, storage } from '../firebase';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp, setDoc
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const userName = (user) => user?.name || user?.displayName || 'User';
const userEmail = (user) => user?.email || '';

export const addLog = async (action, details, user) => {
  try {
    await addDoc(collection(db, 'logs'), {
      action, details,
      userName: userName(user),
      userEmail: userEmail(user),
      userPhoto: user?.photoURL || '',
      timestamp: serverTimestamp()
    });
  } catch (e) { console.warn('Log error:', e); }
};

// ─── Image upload with progress + retry + compression ───────────────────────
export const uploadImage = async (file, path, onProgress) => {
  // Compress image before upload to avoid large file issues
  const compressed = await compressImage(file, 800, 0.75);

  return new Promise((resolve, reject) => {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._]/g, '_')}`;
    const storageRef = ref(storage, `${path}/${fileName}`);
    const task = uploadBytesResumable(storageRef, compressed);

    task.on('state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        if (onProgress) onProgress(pct);
      },
      (error) => {
        console.error('Upload error:', error.code, error.message);
        reject(new Error(getUploadErrorMsg(error.code)));
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
};

// Compress image to max width/quality before upload
const compressImage = (file, maxWidth, quality) => {
  return new Promise((resolve) => {
    // If not an image or file is small, skip compression
    if (!file.type.startsWith('image/') || file.size < 200 * 1024) {
      resolve(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => resolve(blob || file), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
};

const getUploadErrorMsg = (code) => {
  switch (code) {
    case 'storage/unauthorized': return 'Permission denied. Check Firebase Storage rules.';
    case 'storage/canceled': return 'Upload cancelled.';
    case 'storage/unknown': return 'Unknown error. Check internet connection.';
    case 'storage/quota-exceeded': return 'Storage quota exceeded.';
    case 'storage/unauthenticated': return 'Please login again.';
    case 'storage/retry-limit-exceeded': return 'Upload timed out. Try a smaller image.';
    default: return `Upload failed (${code}). Try again.`;
  }
};

// ─── Materials ───────────────────────────────────────────────────────────────
export const addMaterial = async (data, user) => {
  const docRef = await addDoc(collection(db, 'materials'), {
    ...data,
    createdBy: userName(user),
    createdByEmail: userEmail(user),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  await addLog('ADD_MATERIAL', `Added material: ${data.name} (₹${data.totalCost})`, user);
  return docRef;
};

export const updateMaterial = async (id, data, user) => {
  await updateDoc(doc(db, 'materials', id), {
    ...data, updatedAt: serverTimestamp(), updatedBy: userName(user)
  });
  await addLog('EDIT_MATERIAL', `Edited material: ${data.name}`, user);
};

export const deleteMaterial = async (id, name, user) => {
  await deleteDoc(doc(db, 'materials', id));
  await addLog('DELETE_MATERIAL', `Deleted material: ${name}`, user);
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const addPayment = async (data, user) => {
  const docRef = await addDoc(collection(db, 'payments'), {
    ...data,
    createdBy: userName(user),
    createdByEmail: userEmail(user),
    createdAt: serverTimestamp()
  });
  await addLog('ADD_PAYMENT', `Added payment: ₹${data.amount} to ${data.paymentTo}`, user);
  return docRef;
};

export const updatePayment = async (id, data, user) => {
  await updateDoc(doc(db, 'payments', id), {
    ...data, updatedAt: serverTimestamp(), updatedBy: userName(user)
  });
  await addLog('EDIT_PAYMENT', `Edited payment: ₹${data.amount} to ${data.paymentTo}`, user);
};

export const deletePayment = async (id, data, user) => {
  await deleteDoc(doc(db, 'payments', id));
  await addLog('DELETE_PAYMENT', `Deleted payment to ${data.paymentTo}`, user);
};

// ─── Photos ──────────────────────────────────────────────────────────────────
export const addPhoto = async (data, user) => {
  await addDoc(collection(db, 'photos'), {
    ...data,
    createdBy: userName(user),
    createdByEmail: userEmail(user),
    createdAt: serverTimestamp()
  });
  await addLog('ADD_PHOTO', `Added daily photo`, user);
};

// ─── Budget ──────────────────────────────────────────────────────────────────
export const saveBudget = async (amount) => {
  await setDoc(doc(db, 'settings', 'budget'), { amount, updatedAt: serverTimestamp() });
};

// ─── Realtime listener ───────────────────────────────────────────────────────
export const listenTo = (collectionName, callback, orderField = 'createdAt') => {
  const q = query(collection(db, collectionName), orderBy(orderField, 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error(`listenTo ${collectionName} error:`, err);
  });
};
