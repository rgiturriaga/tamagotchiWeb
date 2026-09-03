import { useState, useEffect } from "react";
import { getCommunityPets } from "../api";
import { SPECIES_META, getMoodLabel } from "../constants";
import Navbar from "../components/Navbar";
import "./CommunityPage.css";

export default function CommunityPage({ onNavigate }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommunityPets()
      .then(setPets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="community-page">
      <Navbar page="community" onNavigate={onNavigate} />

      <main className="community-main">
        <div className="community-header">
          <h1>Community Pets</h1>
          <p>See all the creatures your friends are raising.</p>
        </div>

        {loading ? (
          <div className="community-loading">
            <div className="community-spinner" />
            <span>Loading pets...</span>
          </div>
        ) : pets.length === 0 ? (
          <div className="community-empty">
            <div className="community-empty-icon" />
            <p>No pets found. Be the first to raise one.</p>
          </div>
        ) : (
          <div className="community-grid">
            {pets.map((pet) => {
              const meta = SPECIES_META[pet.species_id];
              return (
                <div
                  key={pet.id}
                  className="community-card"
                  style={{
                    "--pet-color": meta.color,
                    borderColor: meta.cardBorder,
                    background: `radial-gradient(ellipse at top, ${meta.cardBg} 0%, rgba(10,10,15,0.95) 70%)`,
                  }}
                >
                  <div className="cc-header">
                    <span
                      className="cc-type"
                      style={{ background: `${meta.color}22`, color: meta.color }}
                    >
                      {meta.type}
                    </span>
                    <span className="cc-mood">{getMoodLabel(pet)}</span>
                  </div>

                  <img
                    src={meta.images[pet.evolution_stage]}
                    alt={pet.name}
                    className="cc-sprite"
                  />

                  <div className="cc-info">
                    <h3 className="cc-name">{pet.name}</h3>
                    <p className="cc-stage">
                      Lv.{pet.level} — {meta.stages[pet.evolution_stage]}
                    </p>
                  </div>

                  <div className="cc-stats">
                    {[
                      { label: "Hunger",    value: pet.hunger },
                      { label: "Happiness", value: pet.happiness },
                      { label: "Health",    value: pet.health },
                    ].map(({ label, value }) => (
                      <div key={label} className="cc-stat">
                        <span className="cc-stat-label">{label}</span>
                        <div className="cc-bar-bg">
                          <div
                            className="cc-bar-fill"
                            style={{ width: `${value}%`, background: meta.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {pet.is_sleeping && (
                    <div className="cc-sleeping">Sleeping</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
