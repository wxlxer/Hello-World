// 签到
namespace qpq.game101
{
	export class SignIn extends gamelib.core.Ui_NetHandle
	{
		private _items: Array<Laya.Component>;
		private _data: any;
		private _index: number;

		constructor() 
		{
			super('qpq.ui.Art_SignUI');
		}
		// 初始化
		protected init():void
		{
            super.init();
			this.addBtnToListener("btn_lq");	// 马上领取
			this._items = [];
			for(var i:number = 1; i <= 7; i++)
			{
				this._items.push(this._res['ui_item_' + i]);
				this._res['ui_item_' + i].visible = false;
			}
			this._noticeOther = true;
		}
        // 显示
		protected onShow():void
		{
			super.onShow();
            this._data = g_signInfo;
			if(this._data == null)
			{
				sendNetMsg(0x0F1A);
			}
			else
			{
				this.setSiginData();
			}
			for(var i:number = 0; i < this._items.length; i++)
			{
				var item = this._items[i];
				item['btn_bq'].on(Laya.Event.CLICK,this,this.onClickBQ,[i + 1]);
			}
			playSound_qipai("open");
		}
        // 隐藏
		protected onClose():void
		{
			super.onClose();
		}

		private onClickQD(index:number,evt:Laya.Event):void
		{
			playButtonSound();
			sendNetMsg(0x0F1B,1,index);
			evt.currentTarget['disabled'] = true;
		}
		private onClickBQ(index:number,evt:Laya.Event):void
		{
			playButtonSound();
			sendNetMsg(0x0F1B,2,index);
			evt.currentTarget['disabled'] = true;
		}
        // 协议
		public reciveNetMsg(msgId:number,data:any):void
		{
			switch(msgId)
			{
				case 0x0F1A:	// 公共配置签到列表
					this._data = data;
					this.setSiginData();
					break;

				case 0x0F1B:	// 公共配置签到
					if(data.result == 0)
					{
						g_uiMgr.showTip("签到失败");
						return;
					}
					this.setSiginData();
					break;
			}
		}
        // 按钮
		protected onClickObjects(evt:Laya.Event):void
		{
			playButtonSound();
			switch(evt.currentTarget.name)
			{
				case "btn_lq":  // 马上领取
					playButtonSound();
					sendNetMsg(0x0F1B,1,this._index);
					evt.currentTarget['disabled'] = true;
					break;
			}
		}
		// 设置签到数据
		private setSiginData():void
		{
			if(this._data == null)
			{
				return;
			}
			this._index = -1;
			
			var day: Array<string> = ['第一天','第二天','第三天','第四天','第五天','第六天','第七天']
			
			for(var i: number = 0; i < this._items.length ;i++)
			{
				var item:Laya.Component = this._items[i];
				var data:any = this._data.list[i];
				if(data == null)
				{
					item.visible = false;
					continue;
				}
				var num:number = data.awards[0].num;
				item['txt_1'].text = num +"";	// 奖励
				item['txt_2'].text = day[i];	// 天数
				item['img_money'].skin = "hall/goods_"+(i + 1)+".png"
				item.disabled = data.statue == 4;//未到时
				item.alpha = 1;
				item.visible = true;
				switch (data.statue)
				{
					case 0:				// 时间未到
					case 4:				// 已过期	
						
						item['btn_bq'].visible = false;		// 补签
						item['img_yqd'].visible = false;	// 已领取
						break;
					case 1:				//可以签到	
						this._index = i + 1;				
						item['btn_bq'].visible = false;
						item['img_yqd'].visible = false;
						break;
					case 2:				//已签到				
						item['btn_bq'].visible = false;
						item['img_yqd'].visible = true;
						item.alpha = 0.5;
						break;	
					case 3:				//可补签
						item['btn_bq'].visible = true;
						item['img_yqd'].visible = false;
						break;	
					default:
						// code...
						break;
				}
				num = 0;
				item['txt_3'].visible = false;
			}
			this._res['btn_lq'].disabled = this._index == -1;
		}
	}
	
}