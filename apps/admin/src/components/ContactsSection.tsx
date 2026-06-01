import React from "react";
import type { ContactMessage } from "@shared/types";

interface Props {
  contacts: ContactMessage[];
  loading: boolean;
  total: number;
  page: number;
  onMarkRead: (id: string) => void;
}

export default function ContactsSection({ contacts, loading, total, page, onMarkRead }: Props) {
  return (
    <section>
      <div className="section-header">
        <h2>Pesan Kontak</h2>
      </div>
      {loading ? (
        <p>Memuat pesan...</p>
      ) : (
        <div className="contacts-list">
          {contacts.map((item) => (
            <article key={item.id} className="contact-item">
              <h3>{item.name} — {item.org}</h3>
              <p>{item.message}</p>
              <div className="contact-actions">
                {item.status === "new" && <button onClick={() => onMarkRead(item.id ?? "")}>Mark Read</button>}
              </div>
            </article>
          ))}
          <p>{total} items — page {page}</p>
        </div>
      )}
    </section>
  );
}
