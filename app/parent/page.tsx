'use client';
import {Provider} from '@/components/staff/context';
import ParentPortal from '@/components/parent/portal';
import './parent.css';
import '../public/public.css';
export default function ParentPage(){return <Provider><ParentPortal/></Provider>}
