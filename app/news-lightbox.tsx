"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {ChevronLeft,ChevronRight,X} from "lucide-react";

type LightboxImage={src:string;alt:string};

function Lightbox({images,index,onClose,onChange}:{images:LightboxImage[];index:number;onClose:()=>void;onChange:(index:number)=>void}){
  const total=images.length;
  const closeRef=useRef<HTMLButtonElement>(null);
  const touchStart=useRef<number|null>(null);
  const prev=useCallback(()=>onChange((index-1+total)%total),[index,total,onChange]);
  const next=useCallback(()=>onChange((index+1)%total),[index,total,onChange]);

  useEffect(()=>{
    const previousFocus=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    closeRef.current?.focus();
    return()=>{document.body.style.overflow=overflow;previousFocus?.focus()};
  },[]);

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape")onClose();
      else if(total>1&&event.key==="ArrowLeft")prev();
      else if(total>1&&event.key==="ArrowRight")next();
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[onClose,prev,next,total]);

  // Pré-carrega as imagens vizinhas para a navegação ficar instantânea.
  useEffect(()=>{
    if(total<2)return;
    [images[(index+1)%total],images[(index-1+total)%total]].forEach((image)=>{const img=new Image();img.src=image.src});
  },[images,index,total]);

  const current=images[index];
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Visualização da imagem" onClick={onClose}
      onTouchStart={(event)=>{touchStart.current=event.touches[0].clientX}}
      onTouchEnd={(event)=>{if(touchStart.current===null||total<2)return;const delta=event.changedTouches[0].clientX-touchStart.current;touchStart.current=null;if(Math.abs(delta)>50)(delta>0?prev:next)()}}>
      <button ref={closeRef} type="button" className="lightbox-close" aria-label="Fechar" onClick={onClose}><X size={26}/></button>
      {total>1&&<button type="button" className="lightbox-nav lightbox-prev" aria-label="Foto anterior" onClick={(event)=>{event.stopPropagation();prev()}}><ChevronLeft size={30}/></button>}
      <figure onClick={(event)=>event.stopPropagation()}>
        <img key={current.src} src={current.src} alt={current.alt}/>
        {total>1&&<figcaption>{index+1} / {total}</figcaption>}
      </figure>
      {total>1&&<button type="button" className="lightbox-nav lightbox-next" aria-label="Próxima foto" onClick={(event)=>{event.stopPropagation();next()}}><ChevronRight size={30}/></button>}
    </div>,
    document.body
  );
}

export function ZoomableImage({src,alt}:LightboxImage){
  const [open,setOpen]=useState(false);
  const close=useCallback(()=>setOpen(false),[]);
  return <>
    <button type="button" className="lightbox-trigger news-cover-trigger" onClick={()=>setOpen(true)} aria-label="Ampliar imagem de capa"><img src={src} alt={alt}/></button>
    {open&&<Lightbox images={[{src,alt}]} index={0} onClose={close} onChange={()=>{}}/>}
  </>;
}

export function GalleryGrid({images}:{images:LightboxImage[]}){
  const [active,setActive]=useState<number|null>(null);
  const close=useCallback(()=>setActive(null),[]);
  return <>
    <div>{images.map((image,index)=><button type="button" key={`${image.src}-${index}`} className="lightbox-trigger" onClick={()=>setActive(index)} aria-label={`Ampliar foto ${index+1} de ${images.length}`}><img src={image.src} alt={image.alt} loading="lazy"/></button>)}</div>
    {active!==null&&<Lightbox images={images} index={active} onClose={close} onChange={setActive}/>}
  </>;
}
