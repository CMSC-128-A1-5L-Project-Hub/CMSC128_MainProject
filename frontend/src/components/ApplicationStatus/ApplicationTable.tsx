import type { Application } from "../ApplicationStatusModal";

interface ApplicationTableProps {
    applications: Application[];
    onView: (application: Application) => void;
}

const rowStyles: Record<string, { bg: string; text: string}> = {
    approved:      { bg: '#1A7A4A', text: '#000000'},
    pending:       { bg: '#FFFFFF', text: '#000000'},
    'under review':{ bg: '#6B3AB7', text: '#000000'},
    rejected:      { bg: '#6B0F2B', text: '#9A7080'},
    waitlisted:    { bg: '#EFF4FF', text: '#000000'},
}

export default function ApplicationTable({applications, onView}: ApplicationTableProps){

}


