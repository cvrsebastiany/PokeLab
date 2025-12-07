import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import oshawottGif from "../assets/oshawott.gif";
import "./Cadastro.css";

const API_URL = import.meta.env.VITE_API_URL;

function Cadastro() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navegar = useNavigate();

  // Formata telefone no padrão (99) 99999-9999
  function formatoTelefone(value) {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length > 11) return telefone;
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  // Valida campos do formulário
  function formatoValido() {
    const telefoneValido = /^\(\d{2}\) \d{5}-\d{4}$/.test(telefone);
    return (
      nome.trim() !== "" &&
      telefoneValido &&
      email.trim() !== "" &&
      senha.length >= 6 &&
      perfil !== ""
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formatoValido()) return;
    setLoading(true);
    setError("");

    try {
      // Converte perfil em perfilId
      const perfilMap = {
        treinador: 1,
        profissionalSaude: 2,
        tecnicoLaboratorio: 3,
      };

      const body = {
        nome,
        telefone,
        email,
        senha,
        perfilId: perfilMap[perfil],
        ativo: true,
      };

      const response = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar usuário");
      }

      alert("Cadastro realizado com sucesso!");
      navegar("/", { replace: true });
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <img
          src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e8ddc4da-23dd-4502-b65b-378c9cfe5efa/dffpqjc-645c8699-888a-4f3b-b037-418d4ee0f6be.png/v1/fill/w_1280,h_1280/pokemon_center_logo_by_jormxdos_dffpqjc-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiIvZi9lOGRkYzRkYS0yM2RkLTQ1MDItYjY1Yi0zNzhjOWNmZTVlZmEvZGZmcHFqYy02NDVjODY5OS04ODhhLTRmM2ItYjAzNy00MThkNGVlMGY2YmUucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.uBCZnpD-O359RLab8MCpWzJS296c1DXQRabuTLvlOSM"
          alt="Pokélab Logo"
          className="cadastro-logo"
        />
        <h1 className="cadastro-title">Cadastro</h1>

        {error && (
          <div
            className="error-message"
            style={{
              backgroundColor: "#fee",
              color: "#c33",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="cadastro-group">
            <label>Nome</label>
            <input
              type="text"
              placeholder="Ash Ketchum"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="cadastro-group">
            <label>Telefone</label>
            <input
              type="tel"
              placeholder="(99) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(formatoTelefone(e.target.value))}
              required
              disabled={loading}
            />
          </div>

          <div className="cadastro-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="ash.ketchum@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="cadastro-group">
            <label>Senha</label>
            <div className="senha-wrapper">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={loading}
              />

              <button
                type="button"
                className="toggle-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                disabled={loading}
              >
                {mostrarSenha ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="cadastro-group">
            <label>Perfil</label>
            <div className="select-wrapper">
              <select
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Selecione</option>
                <option value="treinador">Treinador</option>
                <option value="profissionalSaude">Profissional da Saúde</option>
                <option value="tecnicoLaboratorio">Técnico de Laboratório</option>
              </select>
              <img
                src={oshawottGif}
                alt="Oshawott animado"
                className="perfil-gif"
              />
            </div>
          </div>

          <button
            className="cadastro-button"
            type="submit"
            disabled={!formatoValido() || loading}
          >
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <div className="cadastro-footer">
          <span>Já tem uma conta? </span>
          <Link to="/">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;
