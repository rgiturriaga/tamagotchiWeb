import { useState, useEffect, useCallback } from "react";
import { getMyPets, petAction, deletePet } from "../api";
import { useAuth } from "../context/AuthContext";
import { SPECIES_META, getStatColor, getMoodEmoji } from "../constants";
import NewPetModal from "../components/NewPetModal";
import PetCard from "../components/PetCard";
import Navbar from "../components/Navbar";
import "./HomePage.css";

export default function HomePage({ page, onNavigate }) {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPet, setShowNewPet] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [activePet, setActivePet] = useState(null);

  const loadPets = useCallback(async () => {
    try {
      const data = await getMyPets();
      setPets(data);
      if (data.length > 0 && !activePet) {
        setActivePet(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activePet]);

  useEffect(() => {
    loadPets();
    const interval = setInterval(loadPets, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [loadPets]);

  const handleAction = async (petId, action) => {
    try {
      const result = await petAction(petId, action);
      setActionMsg({ type: result.success ? "success" : "warning", text: result.message });
      setPets((prev) => prev.map((p) => (p.id === petId ? result.pet : p)));
      setTimeout(() => setActionMsg(null), 3000);
    } catch (e) {
      setActionMsg({ type: "error", text: e.message });
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleDelete = async (petId) => {
    if (!confirm("Are you sure? Your pet will be gone forever! 💔")) return;
    try {
      await deletePet(petId);
      setPets((prev) => prev.filter((p) => p.id !== petId));
      setActivePet(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handlePetCreated = (newPet) => {
    setPets((prev) => [...prev, newPet]);
    setActivePet(newPet.id);
    setShowNewPet(false);
  };

  const selectedPet = pets.find((p) => p.id === activePet) || pets[0];

  return (
    <div className="home-page">
      <Navbar page={page || "home"} onNavigate={onNavigate} />

      {/* Action message toast */}
      {actionMsg && (
        <div className={`toast toast-${actionMsg.type}`}>
          {actionMsg.text}
        </div>
      )}

      <main className="home-main">
        {loading ? (
          <div className="loading-screen">
            <div className="loading-egg">🥚</div>
            <p>Loading your pets...</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-egg-anim">🥚</div>
            <h2>No pets yet, {user?.username}!</h2>
            <p>Choose your first companion to begin your journey.</p>
            <button
              id="btn-adopt-first"
              className="btn-primary"
              onClick={() => setShowNewPet(true)}
            >
              ✨ Adopt a Pet
            </button>
          </div>
        ) : (
          <div className="home-layout">
            {/* Pet selector sidebar */}
            <aside className="pet-sidebar">
              <h3 className="sidebar-title">My Pets</h3>
              <div className="pet-list">
                {pets.map((pet) => {
                  const meta = SPECIES_META[pet.species_id];
                  return (
                    <button
                      key={pet.id}
                      id={`pet-tab-${pet.id}`}
                      className={`pet-tab ${activePet === pet.id ? "active" : ""} ${!pet.is_alive ? "dead" : ""}`}
                      style={activePet === pet.id ? { borderColor: meta.color, color: meta.color } : {}}
                      onClick={() => setActivePet(pet.id)}
                    >
                      <span className="pet-tab-emoji">{meta.emoji}</span>
                      <div className="pet-tab-info">
                        <span className="pet-tab-name">{pet.name}</span>
                        <span className="pet-tab-species">Lv.{pet.level} {meta.stages[pet.evolution_stage]}</span>
                      </div>
                      <span className="pet-tab-mood">{getMoodEmoji(pet)}</span>
                    </button>
                  );
                })}
              </div>

              {pets.length < 3 && (
                <button
                  id="btn-adopt-new"
                  className="btn-adopt"
                  onClick={() => setShowNewPet(true)}
                >
                  + Adopt
                </button>
              )}
            </aside>

            {/* Main pet view */}
            {selectedPet && (
              <PetCard
                pet={selectedPet}
                onAction={handleAction}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </main>

      {showNewPet && (
        <NewPetModal
          onClose={() => setShowNewPet(false)}
          onCreated={handlePetCreated}
        />
      )}
    </div>
  );
}
