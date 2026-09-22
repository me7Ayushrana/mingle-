export async function pickImageFromGallery(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      if (typeof document === 'undefined') {
        resolve(null);
        return;
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';

      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve(dataUrl);
        };
        reader.onerror = () => {
          resolve(null);
        };
        reader.readAsDataURL(file);
      };

      input.oncancel = () => {
        resolve(null);
      };

      document.body.appendChild(input);
      input.click();
      setTimeout(() => {
        try {
          document.body.removeChild(input);
        } catch {}
      }, 1000);
    } catch (err) {
      console.error('Web file picker error:', err);
      resolve(null);
    }
  });
}

export async function takePhotoWithCamera(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      if (typeof document === 'undefined') {
        resolve(null);
        return;
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.setAttribute('capture', 'environment');
      input.style.display = 'none';

      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve(dataUrl);
        };
        reader.onerror = () => {
          resolve(null);
        };
        reader.readAsDataURL(file);
      };

      document.body.appendChild(input);
      input.click();
      setTimeout(() => {
        try {
          document.body.removeChild(input);
        } catch {}
      }, 1000);
    } catch {
      resolve(null);
    }
  });
}
