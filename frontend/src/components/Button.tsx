import React from 'react';

interface ButtonProps {
    label?: string;
    onClick?: () => void;
}

function Button({ label = 'Button', onClick }: ButtonProps) {
    return <button onClick={onClick}>{label}</button>;
}

export default Button;