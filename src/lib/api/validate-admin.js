export const validateAdmin = (session) => {
    if (!session) {
        return {
            success: false,
            message: 'Unauthorized',
            status: 401
        };
    }
    if (session.user.role !== 'admin') {
        return {
            success: false,
            message: 'Forbidden: Admins only',
            status: 403
        };
    }
    return {
        success: true,
        message: 'Validation successful',
        status: 200
    };
}

