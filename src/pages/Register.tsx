import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  AtSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    if (username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError(
        "El nombre de usuario solo puede contener letras, números y guiones bajos"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(
        email,
        password,
        username.toLowerCase(),
        displayName || username
      );

      if (error) {
        if (error.message.includes("User already registered")) {
          setError("Este email ya está registrado");
        } else if (error.message.includes("Password")) {
          setError("La contraseña debe tener al menos 6 caracteres");
        } else {
          setError(error.message);
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <Link to="/">
              <img
                src="/logo.png"
                alt="RunKing"
                className="h-20 object-contain"
              />
            </Link>
          </div>

          <Card className="glass rounded-squircle-xl">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-white">
                  ¡Registro exitoso!
                </h2>
                <p className="text-white/60">
                  Hemos enviado un email de confirmación a{" "}
                  <strong className="text-white">{email}</strong>. Por favor
                  revisa tu bandeja de entrada y confirma tu cuenta.
                </p>
              </div>
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="w-full"
              >
                Ir a Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <Link to="/" className="group">
            <img
              src="/logo.png"
              alt="RunKing"
              className="h-24 object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <p className="text-white/50 text-center">Únete a la comunidad de rankings</p>
        </div>

        {/* Register Card */}
        <Card className="glass rounded-squircle-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="font-display text-2xl text-center text-white">
              Crear Cuenta
            </CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert
                  variant="destructive"
                  className="animate-scale-in bg-red-500/10 border-red-500/20 text-red-400"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80">
                  Nombre de usuario
                </Label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="tu_usuario"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                      )
                    }
                    className="pl-11"
                    required
                    disabled={isLoading}
                    maxLength={20}
                  />
                </div>
                <p className="text-xs text-white/40">
                  Solo letras, números y guiones bajos. Mínimo 3 caracteres.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-white/80">
                  Nombre para mostrar{" "}
                  <span className="text-white/40">(opcional)</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Tu Nombre"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-11"
                    disabled={isLoading}
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-white/40">Mínimo 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>

              <p className="text-sm text-center text-white/50">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Inicia Sesión
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Back to home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
