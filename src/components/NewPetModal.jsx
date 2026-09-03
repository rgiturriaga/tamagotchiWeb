import { useState } from "react";
import { createPet } from "../api";
import { SPECIES_META } from "../constants";
import "./NewPetModal.css";

export default function NewPetModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1); // 1 = choose species, 2 = name
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) { setError("Give your pet a name!"); return; }
    if (name.length > 20) { setError("Name too long (max 20 chars)"); return; }
    setLoading(true);
    setError("");
    try {
      const pet = await createPet(name.trim(), selectedSpecies);
      onCreated(pet);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button id="modal-close" className="modal-close" onClick={onClose}>✕</button>

        {step === 1 ? (
          <>
            <h2 className="modal-title">Choose Your Companion</h2>
            <p className="modal-subtitle">Each starter has unique stats and 3 evolution stages</p>

            <div className="species-grid">
              {[1, 2, 3].map((id) => {
                const meta = SPECIES_META[id];
                const selected = selectedSpecies === id;
                return (
                  <button
                    key={id}
                    id={`species-btn-${id}`}
                    className={`species-card ${selected ? "selected" : ""}`}
                    style={selected ? {
                      borderColor: meta.color,
                      boxShadow: `0 0 30px ${meta.colorGlow}`,
                      background: meta.cardBg,
                    } : {}}
                    onClick={() => setSelectedSpecies(id)}
                  >
                    <img
                      src={meta.images[0]}
                      alt={meta.name}
                      className="species-img"
                    />
                    <div className="species-name" style={selected ? { color: meta.color } : {}}>
                      {meta.emoji} {meta.name}
                    </div>
                    <div
                      className="species-type"
                      style={{ background: `${meta.color}22`, color: meta.color }}
                    >
                      {meta.type} Type
                    </div>
                    <p className="species-desc">{meta.description}</p>
                    <div className="species-evolutions">
                      {meta.stages.map((stage, i) => (
                        <span key={i} className="stage-pill">
                          {i === 0 ? "🥚" : i === 1 ? "🌱" : "⭐"} {stage}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              id="btn-next-species"
              className="modal-btn"
              disabled={!selectedSpecies}
              onClick={() => setStep(2)}
            >
              Choose {selectedSpecies ? SPECIES_META[selectedSpecies].name : "…"} →
            </button>
          </>
        ) : (
          <>
            <button className="modal-back" onClick={() => setStep(1)}>← Back</button>
            <h2 className="modal-title">Name Your {SPECIES_META[selectedSpecies].emoji} {SPECIES_META[selectedSpecies].name}</h2>

            <div className="chosen-preview">
              <img
                src={SPECIES_META[selectedSpecies].images[0]}
                alt={SPECIES_META[selectedSpecies].name}
                className="chosen-img"
              />
              <p className="chosen-desc">{SPECIES_META[selectedSpecies].description}</p>
            </div>

            <div className="name-field">
              <input
                id="pet-name-input"
                type="text"
                placeholder="Enter a name..."
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <span className="name-counter">{name.length}/20</span>
            </div>

            {error && <div className="modal-error">⚠️ {error}</div>}

            <button
              id="btn-confirm-pet"
              className="modal-btn"
              style={{ background: `linear-gradient(135deg, ${SPECIES_META[selectedSpecies].color}, ${SPECIES_META[selectedSpecies].color}99)` }}
              disabled={!name.trim() || loading}
              onClick={handleCreate}
            >
              {loading ? "Hatching..." : `Hatch ${name || "…"} 🥚`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
