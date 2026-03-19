import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export default function PendingPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-sm border-0 ring-1 ring-slate-200">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl">Verification Pending</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Your doctor account has been successfully created and is currently under review.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-slate-500 pb-8 pt-4">
                    An administrator will verify your credentials shortly. You will be able to access the Doctor Portal once approved.
                </CardContent>
                <CardFooter className="flex justify-center border-t bg-slate-50 p-4">
                    <form action={logout} className="w-full">
                        <Button variant="outline" className="w-full" type="submit">
                            Sign out
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}
