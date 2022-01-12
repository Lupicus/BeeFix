var asmapi = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var AbstractInsnNode = Java.type('org.objectweb.asm.tree.AbstractInsnNode')
var LabelNode = Java.type('org.objectweb.asm.tree.LabelNode')
var VarInsnNode = Java.type('org.objectweb.asm.tree.VarInsnNode')
var JumpInsnNode = Java.type('org.objectweb.asm.tree.JumpInsnNode')
var InsnNode = Java.type('org.objectweb.asm.tree.InsnNode')

function initializeCoreMod() {
    return {
    	'World': {
    		'target': {
    			'type': 'CLASS',
    			'name': 'net.minecraft.world.World'
    		},
    		'transformer': function(classNode) {
    			var count = 0
    			var fn = asmapi.mapMethod('func_72947_a') // calculateInitialWeather
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn) {
    					patch_func_72947_a(obj)
    					count++
    				}
    			}
    			if (count < 1)
    				asmapi.log("ERROR", "Failed to modify World: Method not found")
    			return classNode;
    		}
    	}
    }
}

// add if (!this.dimensionType().hasSkyLight()) return
function patch_func_72947_a(obj) {
	var f1 = asmapi.mapMethod('func_230315_m_') // dimensionType
	var n1 = "net/minecraft/world/World"
	var f2 = asmapi.mapMethod('func_218272_d') // hasSkyLight
	var n2 = "net/minecraft/world/DimensionType"
	var op6 = new LabelNode()
	var op1 = new VarInsnNode(opc.ALOAD, 0)
	var op2 = asmapi.buildMethodCall(n1, f1, "()Lnet/minecraft/world/DimensionType;", asmapi.MethodType.VIRTUAL)
	var op3 = asmapi.buildMethodCall(n2, f2, "()Z", asmapi.MethodType.VIRTUAL)
	var op4 = new JumpInsnNode(opc.IFNE, op6)
	var op5 = new InsnNode(opc.RETURN)
	var list = asmapi.listOf(op1, op2, op3, op4, op5, op6)
	var node = obj.instructions.getFirst()
	if (node.getType() == AbstractInsnNode.LABEL)
		node = node.getNext()
	obj.instructions.insertBefore(node, list)
}
