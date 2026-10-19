
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  try {
    const {
      data: { session },
      error,
    } = await supabaseService.client.auth.getSession();

    if (!error && session) {
      return true;
    }
  } catch {
    // If session retrieval fails, deny access.
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
