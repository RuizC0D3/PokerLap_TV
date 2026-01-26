export function PlayersWidget() {
  return (
    <div className="w-full h-full tv-card-blanca tv-card-columna">
      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <div className="tv-logo-texto">Entradas</div>
          <div className="tv-nivel-numero">84</div>
        </div>
        <div>
          <div className="tv-logo-texto">Recompras</div>
          <div className="tv-nivel-numero">32</div>
        </div>
        <div>
          <div className="tv-logo-texto">Addons</div>
          <div className="tv-nivel-numero">21</div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 24 }}>
        <div>
          <div className="tv-logo-texto">Vivos</div>
          <div className="tv-nivel-numero">27</div>
        </div>
        <div>
          <div className="tv-logo-texto">Mesas</div>
          <div className="tv-nivel-numero">4</div>
        </div>
      </div>
    </div>
  );
}