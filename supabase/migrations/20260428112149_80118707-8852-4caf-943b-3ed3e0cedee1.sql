
-- ─────────────── Roles ───────────────
CREATE TYPE public.app_role AS ENUM ('admin', 'tecnico', 'visualizador');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'tecnico',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- security-definer to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ─────────────── Clientes ───────────────
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf_cnpj TEXT DEFAULT '',
  telefone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  municipio TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  obs TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────── Imóveis ───────────────
CREATE TABLE public.imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  matricula TEXT NOT NULL DEFAULT '',
  codigo_incra TEXT DEFAULT '',
  ccir TEXT DEFAULT '',
  municipio TEXT DEFAULT '',
  comarca TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  area_ha NUMERIC NOT NULL DEFAULT 0,
  area_m2 NUMERIC NOT NULL DEFAULT 0,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  proprietario_nome TEXT DEFAULT '',
  cpf_cnpj TEXT DEFAULT '',
  conjuge TEXT,
  cpf_conjuge TEXT,
  situacao TEXT DEFAULT 'Em andamento',
  obs TEXT,
  data_inicio DATE,
  data_previsao DATE,
  responsavel_tecnico TEXT DEFAULT '',
  equipe_campo JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'campo',
  progresso INTEGER NOT NULL DEFAULT 0,
  centro_lat NUMERIC,
  centro_lng NUMERIC,
  poligono JSONB DEFAULT '[]'::jsonb,
  vertices JSONB DEFAULT '[]'::jsonb,
  confrontantes JSONB DEFAULT '[]'::jsonb,
  notas_internas TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_imoveis_status ON public.imoveis(status);
CREATE INDEX idx_imoveis_municipio ON public.imoveis(municipio);
CREATE INDEX idx_imoveis_cliente ON public.imoveis(cliente_id);

-- ─────────────── Pontos ───────────────
CREATE TABLE public.pontos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  nome TEXT DEFAULT '',
  tipo TEXT DEFAULT 'Marco',
  categoria TEXT DEFAULT '',
  descricao TEXT DEFAULT '',
  leste NUMERIC,
  norte NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC,
  altitude NUMERIC,
  sistema TEXT DEFAULT 'UTM',
  datum TEXT DEFAULT 'SIRGAS 2000',
  precisao_h NUMERIC DEFAULT 0,
  precisao_v NUMERIC DEFAULT 0,
  metodo TEXT DEFAULT '',
  equipamento TEXT DEFAULT '',
  data DATE,
  operador TEXT DEFAULT '',
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE SET NULL,
  municipio TEXT DEFAULT '',
  obs TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pontos_codigo ON public.pontos(codigo);
CREATE INDEX idx_pontos_imovel ON public.pontos(imovel_id);

-- ─────────────── Documentos ───────────────
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT DEFAULT 'imovel',
  tipo TEXT DEFAULT 'PDF',
  tamanho TEXT DEFAULT '',
  status TEXT DEFAULT 'pendente',
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE CASCADE,
  storage_path TEXT,
  data DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documentos_imovel ON public.documentos(imovel_id);

-- ─────────────── Histórico ───────────────
CREATE TABLE public.historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
  data TIMESTAMPTZ NOT NULL DEFAULT now(),
  usuario TEXT DEFAULT '',
  acao TEXT NOT NULL,
  obs TEXT,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_historico_imovel ON public.historico(imovel_id);

-- ─────────────── Updated_at trigger ───────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_clientes_upd BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_imoveis_upd BEFORE UPDATE ON public.imoveis FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_pontos_upd BEFORE UPDATE ON public.pontos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ─────────────── Auto-create profile + role on signup ───────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)), NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'tecnico');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────── RLS ───────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico ENABLE ROW LEVEL SECURITY;

-- profiles: own + everyone authenticated can read names
CREATE POLICY "profiles_select_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- user_roles: read self, admin manage
CREATE POLICY "roles_select_self" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- internal tables: any authenticated user can CRUD (sistema interno)
CREATE POLICY "clientes_all_auth" ON public.clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "imoveis_all_auth" ON public.imoveis FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pontos_all_auth" ON public.pontos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "documentos_all_auth" ON public.documentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "historico_all_auth" ON public.historico FOR ALL TO authenticated USING (true) WITH CHECK (true);
