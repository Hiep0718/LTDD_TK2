import { useState, useEffect, useCallback } from "react";
import { db } from "../db/database";
import { Contact } from "../types/Contact";

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load from DB
  const loadContacts = useCallback(() => {
    try {
      const result = db.getAllSync(
        "SELECT * FROM contacts ORDER BY name ASC"
      );
      // ✅ SỬA LỖI: Ép kiểu result thành Contact[]
      setContacts(result as Contact[]);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Insert
  const insertContact = useCallback(
    (name: string, phone: string | null, email: string | null) => {
      try {
        const now = Date.now();
        db.runSync(
          "INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)",
          [name, phone, email, 0, now]
        );
        loadContacts();
        return true;
      } catch (error) {
        console.error("Error inserting contact:", error);
        return false;
      }
    },
    [loadContacts]
  );

  // Update
  const updateContact = useCallback(
    (id: number, name: string, phone: string | null, email: string | null) => {
      try {
        db.runSync(
          "UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?",
          [name, phone, email, id]
        );
        loadContacts();
        return true;
      } catch (error) {
        console.error("Error updating contact:", error);
        return false;
      }
    },
    [loadContacts]
  );

  // Delete
  const deleteContact = useCallback(
    (id: number) => {
      try {
        db.runSync("DELETE FROM contacts WHERE id = ?", [id]);
        loadContacts();
        return true;
      } catch (error) {
        console.error("Error deleting contact:", error);
        return false;
      }
    },
    [loadContacts]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    (contact: Contact) => {
      try {
        const newFavorite = contact.favorite === 1 ? 0 : 1;
        db.runSync("UPDATE contacts SET favorite = ? WHERE id = ?", [
          newFavorite,
          contact.id,
        ]);
        loadContacts();
        return true;
      } catch (error) {
        console.error("Error toggling favorite:", error);
        return false;
      }
    },
    [loadContacts]
  );

  // Search + filter
  const searchContacts = useCallback(
    (query: string, favoritesOnly: boolean) => {
      let result = contacts;

      if (query.trim()) {
        const q = query.toLowerCase();
        result = result.filter(
          (contact) =>
            contact.name.toLowerCase().includes(q) ||
            (contact.phone && contact.phone.includes(q))
        );
      }

      if (favoritesOnly) {
        result = result.filter((contact) => contact.favorite === 1);
      }

      return result;
    },
    [contacts]
  );

  // Import from API
  const importFromAPI = useCallback(async () => {
    setIsImporting(true);
    setApiError(null);

    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );

      if (!response.ok) throw new Error("Failed to fetch API data");

      const data = await response.json();
      let importedCount = 0;

      const existingPhones = new Set(contacts.map((c) => c.phone));

      for (const user of data) {
        const phone = user.phone?.split(" ")[0] || "";
        const email = user.email || "";
        const name = user.name || "";

        if (!phone || existingPhones.has(phone)) continue;

        const now = Date.now();
        db.runSync(
          "INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)",
          [name, phone, email, 0, now]
        );

        importedCount++;
      }

      loadContacts();
      return { success: true, importedCount };
    } catch (error) {
      console.error("Error importing:", error);
      setApiError("Không thể tải dữ liệu từ API");
      return { success: false, importedCount: 0 };
    } finally {
      setIsImporting(false);
    }
  }, [contacts, loadContacts]);

  return {
    contacts,
    isLoading,
    isImporting,
    apiError,

    loadContacts,
    insertContact,
    updateContact,
    deleteContact,
    toggleFavorite,
    searchContacts,
    importFromAPI,
  };
};