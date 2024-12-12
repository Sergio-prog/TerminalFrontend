import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

interface LogoutButtonProps {
    disconnect: () => Promise<void>;
  }

export function LogoutButton({ disconnect }: LogoutButtonProps) {
    return (
        <>
            <Button
                size="icon"
                variant="ghost"
                className="text-blue-500 hover:bg-gray-800"
                onClick={async () => {
                    try {
                    await disconnect();
                    } catch (error) {
                    console.error('Error:', error);
                    }
                }}
                title="Logout"
            >
                <LogOut className="h-5 w-5" />
            </Button>
        </>
    )
}