import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./Login.css";
import "./PikachuGif.css";
import pikachuGif from "../assets/pikachu-running.gif";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, senha }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || "Erro ao fazer login");
      }

      const usuarioId = loginData.usuario.id;

      const usuarioResponse = await fetch(`${API_URL}/usuarios/${usuarioId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const usuarioData = await usuarioResponse.json();

      if (!usuarioResponse.ok) {
        throw new Error(usuarioData.message || "Erro ao obter usuário");
      }

      const perfilId = Number(usuarioData.perfilId || usuarioData.perfil?.id);

      switch (perfilId) {
        case 1:
          navigate("/treinador");
          break;
        case 2:
          navigate("/atendimento");
          break;
        case 3:
          navigate("/tecnico");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError(err.message || "Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <img 
          src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e8ddc4da-23dd-4502-b65b-378c9cfe5efa/dffpqjc-645c8699-888a-4f3b-b037-418d4ee0f6be.png/v1/fill/w_1280,h_1280/pokemon_center_logo_by_jormxdos_dffpqjc-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiIvZi9lOGRkYzRkYS0yM2RkLTQ1MDItYjY1Yi0zNzhjOWNmZTVlZmEvZGZmcHFqYy02NDVjODY5OS04ODhhLTRmM2ItYjAzNy00MThkNGVlMGY2YmUucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.uBCZnpD-O359RLab8MCpWzJS296c1DXQRabuTLvlOSM"
          alt="Pokélab Logo"
          className="login-logo"
        />
        <h1 className="login-title">Login</h1>

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
          <div className="login-group">
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

          <div className="login-group">
            <label>Senha</label>
            <div className="senha-wrapper">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Insira sua senha"
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

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Login"}
          </button>

          <div className="login-footer">
            <span>Ainda não tem uma conta? </span>
            <Link to="/cadastro">Cadastro</Link>
          </div>
        </form>
      </div>
    <img
      src={pikachuGif}
      alt="Pikachu correndo"
      className="pikachu-gif"
      draggable={false}
    />
    </div>
  );
}

export default Login;
