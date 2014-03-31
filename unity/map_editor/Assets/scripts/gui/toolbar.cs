using UnityEngine;
using System.Collections;
using System;

public class Toolbar : MonoBehaviour
{
	
		public Manager manager;
		private int toolbarInt = 0;
		private string[] toolbarStrings = {"Move", "Sculpt", "Paint"};
		private enum Windows
		{
				None,
				Building,
				Settings,
				View,
		} 
		private Windows openWindow = Windows.None;
		private bool showCreateBuildingWindow = false;
		private bool showSettingsWindow = false;
		private bool showViewWindow = false;
		private string mapDepthString;
		private float mapDepth;
		private string mapWidthString;
		private float mapWidth;
		private string showing = "";
		private bool showUnits = false;

		void initMapSettings ()
		{
				mapWidth = manager.width;
				mapWidthString = mapWidth.ToString ("r");

				mapDepth = manager.depth;
				mapDepthString = mapDepth.ToString ("r");
		}

		int ModeInt ()
		{
				for (int i = 0; i < toolbarStrings.Length; ++i) {
						if (manager.mode == toolbarStrings [i].ToLower ())
								return i;
				}
				return 0;
		}
	
		Rect unitRect;

		void OnGUI ()
		{

				switch (openWindow) {

				case Windows.View:
						GUILayout.Window (3, ScreenSubRect (10), AddViewContent, "View Mode", GUILayout.MinHeight (100));
						break;

				case Windows.None:
						DrawToolbar ();
						break;

				case Windows.Building:
						GUILayout.Window (1, ScreenSubRect (10), AddBuildingContent, "Building", GUILayout.MinHeight (100));
						break;

				case Windows.Settings:
						GUILayout.Window (2, ScreenSubRect (10), AddSettingsContent, "Map Settings", GUILayout.MinHeight (100));
						break;
				}

		}

		void AddViewContent (int id)
		{
		
				GUILayout.BeginVertical ();

				GUILayout.Space (10);
				GUILayout.BeginHorizontal ();
				if (GUILayout.Button (manager.viewMode == Manager.ViewModes.TopDown ? "[Top Down]}" : "Top Down")) {
						manager.viewMode = Manager.ViewModes.TopDown;
						openWindow = Windows.None;
				}
				if (GUILayout.Button (manager.viewMode == Manager.ViewModes.FirstPerson ? "[First Person]}" : "First Person")) {
						manager.viewMode = Manager.ViewModes.FirstPerson;
						openWindow = Windows.None;
				}

				if (GUILayout.Button ("Cancel")) {
						openWindow = Windows.None;
				}

				GUILayout.EndHorizontal ();

				GUILayout.EndVertical ();
		}
	
		void DrawToolbar ()
		{
				GUILayout.BeginArea (new Rect (0, 0, Screen.width, 40));
				GUILayout.BeginHorizontal ();
				manager.mode = toolbarStrings [GUILayout.Toolbar (ModeInt (), toolbarStrings)].ToLower ();
				if (GUILayout.Button ("Settings")) {
						initMapSettings ();
						openWindow = Windows.Settings;
				}
				if (GUILayout.Button ("Add Building")) {
						openWindow = Windows.Building;
				}
		
				if (GUILayout.Button ("View")) {
						openWindow = Windows.View;
				}
				GUILayout.EndHorizontal ();
				GUILayout.EndArea ();

		}
	
		Rect ScreenSubRect (int indent)
		{
				return new Rect (indent, indent, Screen.width - 2 * indent, 0); // Screen.height - 2 * indent);
		}
	
		void AddSettingsContent (int wID)
		{
				GUILayout.BeginVertical ();

				GUILayout.Space (10);
				GUILayout.BeginHorizontal ();
				GUILayout.Label ("Map Name", GUILayout.Width (100));
				manager.map.name = GUILayout.TextField (manager.map.name);
				GUILayout.EndHorizontal ();

				if (true || !manager.created) {
						GUILayout.BeginHorizontal ();
						GUILayout.BeginVertical ();
						GUILayout.Label ("Width(lon)", GUILayout.Width (100));
						mapWidthString = GUILayout.TextField (mapWidthString);
						if (float.TryParse (mapWidthString, out mapWidth) && mapWidth >= 1) {
								manager.width = mapWidth;
						}
						GUILayout.EndVertical ();
			
						GUILayout.BeginVertical ();
						GUILayout.Label ("Depth(lat)", GUILayout.Width (100));
						mapDepthString = GUILayout.TextField (mapDepthString);
						if (float.TryParse (mapDepthString, out mapDepth) && mapDepth >= 1) {
								manager.depth = mapDepth;
						}
						GUILayout.EndVertical ();
			
						GUILayout.BeginVertical ();
						GUILayout.Label ("units", GUILayout.Width (100));
						if (GUILayout.Button (manager.UnitData ().label)) {
								showUnits = true;
						}
						GUILayout.EndVertical ();
			
			
						if (showUnits) {
								GUILayout.BeginVertical ();
				
								foreach (Units unit in manager.units) {
										if (GUILayout.Button (unit.label)) {
												manager.unit = unit.id;
												showUnits = false;
										}
								}
								if (GUILayout.Button ("Cancel")) {
										showUnits = false;
								}
								GUILayout.EndVertical ();
						}
			
						GUILayout.EndHorizontal ();
				}
		
				GUILayout.Space (10);

				GUILayout.BeginHorizontal ();
				if (true || !manager.created) {
						if (GUILayout.Button ("Create")) {
								openWindow = Windows.None;
								manager.Create ();
						}
						if (GUILayout.Button ("Cancel")) {
								openWindow = Windows.None;
						}
				} else {
						if (GUILayout.Button ("Done")) {
								openWindow = Windows.None;
						}
				}
				GUILayout.EndHorizontal ();

				GUILayout.EndVertical ();	
		}

		void AddBuildingContent (int wID)
		{
				GUILayout.BeginVertical ();
				GUILayout.Space (10);
		
				GUILayout.BeginHorizontal ();
				GUILayout.Label ("Building Name", GUILayout.Width (100));
				GUILayout.TextField ("Building Name");
				GUILayout.EndHorizontal ();

				if (GUILayout.Button ("Create")) {
						openWindow = Windows.None;
				}
				GUILayout.EndVertical ();
		}

		// Use this for initialization
		void Start ()
		{
		}
	
		// Update is called once per frame
		void Update ()
		{
	
		}
}
