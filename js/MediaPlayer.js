/*
 * @author  Cheemon
 * email    cheemonnet@gmail.com
 * Media Player*/
(function(){
    var _,Media;
    var ANIMATION_END='AnimationEnd',
        ANIMATION_PlAY_STATE='animation-play-state',
        ANIMATION_DURATION='animation-duration';
    if (typeof document.body.style.webkitAnimation !== "undefined") {
        ANIMATION_END = 'webkitAnimationEnd';
        ANIMATION_DURATION='-webkit-animation-duration';
    }
    if (typeof document.body.style.webkitAnimation !== "undefined") {
        ANIMATION_PlAY_STATE = '-webkit-animation-play-state';
    }
    var seconds=0;
    /*
     * id: dom id
     */
    function MediaPlayer(id){
        _=this;
        _.id=id;
        _.processWraper           = document.createElement('div');
        _.playBtn                 = document.createElement('i');
        _.process                 = document.createElement('p');
        _.errorTip                = document.createElement('span');

        _.processWraper.className = 'process_cnt';
        _.playBtn.className       = 'circle';
        _.process.className       ='process';
        _.errorTip.className='error';
        Media = new Audio(document.getElementById(_.id).getAttribute('data-src'));
        MediaEvent();
        _.processWraper.appendChild(_.process);
        _.processWraper.appendChild(_.errorTip);
        document.getElementById(_.id).appendChild(_.playBtn);
        document.getElementById(_.id).appendChild(_.processWraper);
        _.playBtn.addEventListener('touchend',function(e){
            e.preventDefault();
            if(_.playBtn.className.indexOf('pause')>-1){
                _.pause();
            }else{
                _.play();
            }
        });
        _.process.addEventListener(ANIMATION_END,function(){
            //play end
            _.playBtn.className='circle';
            _.process.className='process';
        });
        return _;
    };
    MediaPlayer.prototype.play=function(){
        Media.play();
        _.process.style[ANIMATION_DURATION]=seconds+'s';
        _.playBtn.className='circle pause';
        _.process.style[ANIMATION_PlAY_STATE] = 'running';
        _.process.className='process live';
    };
    MediaPlayer.prototype.pause=function(){
        Media.pause();
        _.playBtn.className='circle';
        _.process.style[ANIMATION_PlAY_STATE]='paused';
    };

    function MediaEvent(){
        /*Media Event*/
        Media.addEventListener("error",function(){

            var errorStatus=["","","",""];
            _.errorTip.innerText=errorStatus[Media.error.code-1];

        },false);
        Media.addEventListener("loadedmetadata",function(){
            seconds=Media.duration;
        });
        //waiting
        Media.addEventListener("waiting",function(){
            seconds=Media.duration;
        });

    }
    window["MediaPlayer"]=MediaPlayer;
})();