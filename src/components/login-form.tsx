'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/actions/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Entre com suas credenciais para acessar.</CardDescription>
            </CardHeader>
            <form action={dispatch}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" name="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" type="password" name="password" required />
                    </div>

                    <div
                        className="flex h-8 items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {errorMessage && (
                            <p className="text-sm text-red-500">
                                {errorMessage}
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <LoginButton />
                </CardFooter>
            </form>
        </Card>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <Button className="w-full" aria-disabled={pending} type="submit">
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? 'Entrando...' : 'Entrar'}
        </Button>
    );
}
