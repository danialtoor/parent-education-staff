'use client';
import {Provider} from '@/components/staff/context';
import PublicSite from '@/components/public/site';
import '../parent/parent.css';
import './public.css';
export default function PublicPage(){return <Provider><PublicSite/></Provider>}
