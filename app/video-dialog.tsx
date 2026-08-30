"use client";

import {Play} from "lucide-react";
import {Dialog,DialogContent,DialogDescription,DialogTitle,DialogTrigger} from "@/components/ui/dialog";

export function HistoryVideoDialog(){
  return <Dialog>
    <DialogTrigger asChild>
      <button className="video-card" type="button" aria-label="Assistir ao vídeo Conheça nossa história">
        <img src="/brand/institucional.webp" alt="Empresários reunidos em ambiente profissional"/>
        <span className="play-button"><Play fill="currentColor" size={22}/></span>
        <span className="video-label">Conheça nossa história</span>
      </button>
    </DialogTrigger>
    <DialogContent className="video-dialog" showCloseButton>
      <DialogTitle>Conheça nossa história</DialogTitle>
      <DialogDescription>ACI Sindilojas Três de Maio</DialogDescription>
      <div className="video-frame">
        <iframe src="https://www.youtube-nocookie.com/embed/dpxnA3Y-rg4?autoplay=1" title="Conheça nossa história" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>
      </div>
    </DialogContent>
  </Dialog>;
}
