import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./Cadastro.css";

function Cadastro() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const navegar = useNavigate();

  function formatoTelefone(value) {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length > 11) return telefone;

    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7
    )}`;
  }

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

    alert("Cadastro realizado com sucesso!");
    navegar("/", { replace: true });

    // ##Com o Back funcional:
    // const data = { nome, telefone, email, senha, perfil };

    // try {
    //   await api.post("/cadastro", data);
    //   alert("Cadastro realizado com sucesso!");
    //   navigate("/login");
    // } catch {
    //   alert("Erro ao realizar cadastro");
    // }
  }

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <h1 className="cadastro-title">Cadastro</h1>

        <form onSubmit={handleSubmit}>
          <div className="cadastro-group">
            <label>Nome</label>
            <input
              type="text"
              placeholder="Ash Ketchum"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
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
              />

              <button
                type="button"
                className="toggle-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
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
              >
                <option value="">Selecione</option>
                <option value="treinador">Treinador</option>
                <option value="profissionalSaude">Profissional da Saúde</option>
                <option value="tecnicoLaboratorio">
                  Técnico de Laboratório
                </option>
              </select>
            </div>
          </div>

          <button
            className="cadastro-button"
            type="submit"
            disabled={!formatoValido()}
          >
            Criar conta
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
