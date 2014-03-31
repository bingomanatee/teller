using UnityEngine;
using System.Collections;
using System;

public class toolbar : MonoBehaviour
{
	
		public Manager manager;
		private int toolbarInt = 0;
		private string[] toolbarStrings = {"Move", "Sculpt", "Paint"};
		private bool showCreateBuildingWindow = false;
		private bool showSettingsWindow = false;
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
				GUILayout.BeginArea (new Rect (0, 0, Screen.width, 40));
				GUILayout.BeginHorizontal ();
				manager.mode = toolbarStrings [GUILayout.Toolbar (ModeInt (), toolbarStrings)].ToLower ();
				if (GUILayout.Button ("Settings")) {
						showSettingsWindow = true;
				}
				if (GUILayout.Button ("Add Building")) {
						showCreateBuildingWindow = true;
				}
				GUILayout.EndHorizontal ();
				GUILayout.EndArea ();

				if (showCreateBuildingWindow) {
						showing = "building";
						GUILayout.Window (1, ScreenSubRect (10), AddBuildingContent, "Building");
				} else if (showSettingsWindow) {
						if (showing != "window") {
								initMapSettings ();
								showing = "window";
						}
						GUILayout.Window (2, ScreenSubRect (10), AddSettingsContent, "Map Settings", GUILayout.MinHeight (100));
				}
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
								showing = "";
								showSettingsWindow = false;
								manager.Create ();
						}
						if (GUILayout.Button ("Cancel")) {
								showing = "";
								showSettingsWindow = false;
						}
				} else {
						if (GUILayout.Button ("Done")) {
								showing = "";
								showSettingsWindow = false;
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
						showing = "";
						showCreateBuildingWindow = false;
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
