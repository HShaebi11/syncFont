import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams as useRouterParams,
  type LinkProps,
} from "react-router-dom";
import type { ComponentProps, ReactNode } from "react";

type AppLinkProps = Omit<LinkProps, "to"> & {
  href: string;
  scroll?: boolean;
  children?: ReactNode;
};

export function Link({ href, scroll: _scroll, children, ...props }: AppLinkProps) {
  return (
    <RouterLink to={href} {...props}>
      {children}
    </RouterLink>
  );
}

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (path: string, _options?: { scroll?: boolean }) => navigate(path),
    replace: (path: string, _options?: { scroll?: boolean }) =>
      navigate(path, { replace: true }),
  };
}

export function usePathname(): string {
  return useLocation().pathname;
}

export function useParams<T extends Record<string, string | undefined>>() {
  return useRouterParams() as T;
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

export type { ComponentProps };
