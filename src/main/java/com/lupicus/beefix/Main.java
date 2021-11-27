package com.lupicus.beefix;

import net.minecraftforge.fml.IExtensionPoint.DisplayTest;
import net.minecraftforge.fml.ModLoadingContext;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fmllegacy.network.FMLNetworkConstants;

// The value here should match an entry in the META-INF/mods.toml file
@Mod(Main.MODID)
public class Main
{
    public static final String MODID = "beefix";

    public Main()
    {
        ModLoadingContext.get().registerExtensionPoint(DisplayTest.class,
        		() -> new DisplayTest(() -> FMLNetworkConstants.IGNORESERVERONLY, (a, b) -> true));
    }
}
