import { SPECIES_META, getStatColor, getMoodEmoji } from "../constants";
import "./PetCard.css";

const StatBar = ({ label, value, icon }) => {
  const color = getStatColor(value);
  return (
    <div className="stat-row">
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <div className="stat-bar-bg">
        <div
          className="stat-bar-fill"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 8px ${color}80` }}
        />
      </div>
      <span className="stat-value" style={{ color }}>{Math.round(value)}</span>
    </div>
  );
};

const XPBar = ({ experience, level }) => {
  const xpNeeded = level * 100;
  const pct = Math.min(100, (experience / xpNeeded) * 100);
  return (
    <div className="xp-row">
      <span className="stat-label">EXP</span>
      <div className="stat-bar-bg">
        <div className="stat-bar-fill xp-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="stat-value xp-val">{Math.round(experience)}/{xpNeeded}</span>
    </div>
  );
};

export default function PetCard({ pet, onAction, onDelete }) {
  const meta = SPECIES_META[pet.species_id];
  const mood = getMoodEmoji(pet);
  const stageName = meta.stages[pet.evolution_stage];

  const actions = [
    { id: "feed",  label: "Feed",  emoji: "🍖", disabled: pet.is_sleeping || pet.hunger >= 95 },
    { id: "play",  label: "Play",  emoji: "🎮", disabled: pet.is_sleeping || pet.energy < 15 },
    { id: "sleep", label: pet.is_sleeping ? "Wake Up" : "Sleep", emoji: pet.is_sleeping ? "☀️" : "🌙",
      action: pet.is_sleeping ? "wake" : "sleep", disabled: false },
    { id: "heal",  label: "Heal",  emoji: "💊", disabled: pet.health >= 100 },
  ];

  if (!pet.is_alive) {
    return (
      <div className="pet-card pet-card--dead">
        <div className="pet-dead-content">
          <div className="pet-sprite-dead">💀</div>
          <h2>{pet.name} has passed away</h2>
          <p>They lived a life of {pet.level} levels and {pet.evolution_stage > 0 ? `evolved ${pet.evolution_stage} time(s)` : "never evolved"}.</p>
          <button
            id={`btn-delete-${pet.id}`}
            className="btn-delete"
            onClick={() => onDelete(pet.id)}
          >
            🪦 Rest in Peace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pet-card"
      style={{
        "--pet-color": meta.color,
        "--pet-glow": meta.colorGlow,
        background: `radial-gradient(ellipse at 50% 0%, ${meta.cardBg} 0%, rgba(10,10,15,0.95) 70%)`,
        borderColor: meta.cardBorder,
      }}
    >
      {/* Header */}
      <div className="pet-card-header">
        <div>
          <div className="pet-type-badge" style={{ background: `${meta.color}22`, color: meta.color, borderColor: `${meta.color}44` }}>
            {meta.emoji} {meta.type} Type
          </div>
          <h2 className="pet-name">{pet.name}</h2>
          <p className="pet-stage">Lv.{pet.level} {stageName}</p>
        </div>
        <div className="pet-mood-display">
          <span className="pet-mood-emoji">{mood}</span>
          {pet.is_sleeping && <span className="sleeping-badge">💤 Sleeping</span>}
        </div>
      </div>

      {/* Sprite */}
      <div
        className="pet-sprite-container"
        style={{ boxShadow: `0 0 60px ${meta.colorGlow}` }}
      >
        <img
          src={meta.images[pet.evolution_stage]}
          alt={`${pet.name} - ${stageName}`}
          className="pet-sprite"
          style={{ filter: pet.is_sleeping ? "brightness(0.6) saturate(0.5)" : "none" }}
        />
        {pet.evolution_stage === 0 && (
          <div className="evolution-hint" style={{ color: meta.color }}>
            Next evo at Lv.5 →
          </div>
        )}
        {pet.evolution_stage === 1 && (
          <div className="evolution-hint" style={{ color: meta.color }}>
            Final evo at Lv.15 →
          </div>
        )}
        {pet.evolution_stage === 2 && (
          <div className="evolution-hint" style={{ color: meta.color }}>
            ⭐ Max Evolution!
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="pet-stats">
        <StatBar label="Hunger"    value={pet.hunger}    icon="🍗" />
        <StatBar label="Happiness" value={pet.happiness}  icon="💛" />
        <StatBar label="Energy"    value={pet.energy}     icon="⚡" />
        <StatBar label="Health"    value={pet.health}     icon="❤️" />
        <XPBar experience={pet.experience} level={pet.level} />
      </div>

      {/* Actions */}
      <div className="pet-actions">
        {actions.map((a) => (
          <button
            key={a.id}
            id={`btn-${a.id}-${pet.id}`}
            className="action-btn"
            disabled={a.disabled}
            style={{ "--btn-color": meta.color }}
            onClick={() => onAction(pet.id, a.action || a.id)}
            title={a.label}
          >
            <span className="action-emoji">{a.emoji}</span>
            <span className="action-label">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Delete */}
      <button
        id={`btn-release-${pet.id}`}
        className="btn-release"
        onClick={() => onDelete(pet.id)}
      >
        Release Pet 🌈
      </button>
    </div>
  );
}
