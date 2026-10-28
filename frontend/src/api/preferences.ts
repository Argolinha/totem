import {useEffect, useState} from 'react';
import axios from 'axios';
import {API_BASE_URL} from './client';
export type KioskPreferences={nomeTotem:string;qualidade:string;contagem:string;som:boolean;modoNoturno:boolean};
const defaults:KioskPreferences={nomeTotem:'Vive AI Photobooth',qualidade:'Alta',contagem:'3',som:false,modoNoturno:false};
export function useKioskPreferences(){
 const [preferences,setPreferences]=useState<KioskPreferences>(defaults);
 useEffect(()=>{let active=true;const load=()=>axios.get(API_BASE_URL+'/api/config').then(r=>{if(active)setPreferences({...defaults,...r.data});}).catch(()=>{});void load();window.addEventListener('focus',load);return()=>{active=false;window.removeEventListener('focus',load);};},[]);
 return preferences;
}
