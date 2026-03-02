'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Box, Button, Text } from 'tharaday';

import { LoginFormValues, loginSchema } from '@/features/auth/login-schema';
import { apiRequest } from '@/lib/api-client';
import { AuthSession, writeAuthSession } from '@/lib/auth';

type LoginResponse = {
  token: string;
  user: AuthSession['user'];
};

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginFormValues) =>
      apiRequest<LoginResponse>('/login', {
        method: 'POST',
        body: payload,
        auth: false,
      }),
    onSuccess: (data) => {
      writeAuthSession(data);
      router.push('/');
    },
  });

  return (
    <Box
      className="auth-page-wrapper"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box className="auth-card" display="flex" flexDirection="column" gap={5}>
        <Text variant="h2" weight="bold">
          Tharaday Admin Login
        </Text>

        <form
          className="admin-form"
          onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
        >
          <label className="admin-field">
            <span>Email</span>
            <input type="email" autoComplete="email" {...register('email')} />
            {errors.email && <small>{errors.email.message}</small>}
          </label>

          <label className="admin-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && <small>{errors.password.message}</small>}
          </label>

          {loginMutation.isError && (
            <Text color="danger">{(loginMutation.error as Error).message}</Text>
          )}

          <Button
            type="submit"
            isLoading={loginMutation.isPending}
            size="lg"
            fullWidth
          >
            Sign in
          </Button>
        </form>
      </Box>
    </Box>
  );
}
