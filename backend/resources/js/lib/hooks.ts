import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/components/ui/Toast';

interface FlashProps {
    flash: {
        success: string | null;
        error: string | null;
        message: string | null;
    };
}

export function useFlash() {
    const { props } = usePage<any>();
    const { flash } = props as FlashProps;
    const { success, error, info } = useToast();

    useEffect(() => {
        if (flash.success) {
            success(flash.success);
        }
        if (flash.error) {
            error(flash.error);
        }
        if (flash.message) {
            info(flash.message);
        }
    }, [flash]);
}
