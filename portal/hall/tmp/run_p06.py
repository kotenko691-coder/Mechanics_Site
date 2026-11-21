import os,sys,subprocess,json,hashlib,re,time,urllib.request,types,numpy as np,soundfile as sf,shutil
def sh(c):print(subprocess.run(c,shell=True,capture_output=True,text=True).stdout[-600:])
if not os.path.exists('/content/st2/weights/jdc.bin') or os.path.getsize('/content/st2/weights/jdc.bin')<1000:
    from huggingface_hub import snapshot_download
    snapshot_download(repo_id='microgravity/styletts2-ukrainian',repo_type='space',local_dir='/content/st2')
sh("pip install -q munch pydub pyyaml librosa scipy gruut einops einops_exts txtsplit spaces git+https://github.com/patriotyk/ukrainian-word-stress.git git+https://github.com/patriotyk/ipa-uk.git 2>&1 | tail -3")
sys.path.insert(0,'/content/st2');os.chdir('/content/st2');import infer
S=json.loads(urllib.request.urlopen('https://kotenko691-coder.github.io/Mechanics_Site/portal/hall/tmp/sents_p06.json').read().decode())
NS=types.SimpleNamespace(tqdm=lambda x:x);VP='/content/st2/voices/Олег Лепенець.wav'
h=lambda t:hashlib.sha1(t.encode('utf-8')).hexdigest()[:16]
VD='/content/out/voice_p06';os.makedirs(VD,exist_ok=True);idx={};t0=time.time();print(len(S),flush=True)
for n,t in enumerate(S,1):
    f=VD+'/'+h(t)+'.mp3'
    if not(os.path.exists(f) and os.path.getsize(f)>500):
        tt=re.sub(r'(Записати|Головне|Перевір себе)(?=[А-ЯІЇЄҐ])',r'\1. ',t.lstrip('. '));tt=re.sub(r'([?!.])(?=[А-ЯІЇЄҐ])',r'\1 ',tt).replace('кН','кілоньютон')
        w=infer.inference('multi',tt,VP,NS)[0];sf.write('/content/tmp.wav',w,24000)
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i','/content/tmp.wav','-codec:a','libmp3lame','-b:a','64k','-ac','1',f],check=True)
    idx[h(t)]=1
    if n%20==0:print(n,'/',len(S),round(time.time()-t0),'s',flush=True)
json.dump(idx,open(VD+'/index.json','w'))
shutil.make_archive('/content/voice_p06','zip','/content/out','voice_p06')
print('ГОТОВО',len(os.listdir(VD)),len(S),flush=True)
