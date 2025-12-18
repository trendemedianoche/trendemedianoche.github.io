function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>Tren de Medianoche</h1>
        <p>Noticias, lanzamientos y novedades</p>
      </header>

      <main className="content">
        <section className="card">
          <h2>Novedades</h2>
          <p>Nuevo lanzamiento disponible</p>
        </section>

        <section className="card">
          <h2>Próximos shows</h2>
          <p>Pronto más información</p>
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 Tren de Medianoche</p>
      </footer>
    </div>
  );
}

export default App;
