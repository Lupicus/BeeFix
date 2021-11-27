var asmapi = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var VarInsnNode = Java.type('org.objectweb.asm.tree.VarInsnNode')

function initializeCoreMod() {
    return {
    	'BeehiveEntity': {
    		'target': {
    			'type': 'CLASS',
    			'name': 'net.minecraft.world.level.block.entity.BeehiveBlockEntity'
    		},
    		'transformer': function(classNode) {
    			var count = 0
    			var fn = asmapi.mapMethod('m_58744_') // addOccupantWithPresetTicks
    			var fn2 = asmapi.mapMethod('m_155149_') // tickOccupants
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn) {
    					patch_m_58744_(obj)
    					count++
    				}
    				else if (obj.name == fn2) {
    					patch_m_155149_(obj)
    					count++
    				}
    			}
    			if (count < 2)
    				asmapi.log("ERROR", "Failed to modify BeehiveBlockEntity: Method not found")
    			return classNode;
    		}
    	}
    }
}

// add super.setChanged call
function patch_m_58744_(obj) {
	var f1 = asmapi.mapMethod('m_146870_') // discard
	var n1 = "net/minecraft/world/entity/Entity"
	var node = asmapi.findFirstMethodCall(obj, asmapi.MethodType.VIRTUAL, n1, f1, "()V")
	if (node) {
		var f2 = asmapi.mapMethod('m_6596_') // setChanged
		var n2 = "net/minecraft/world/level/block/entity/BlockEntity"
		var op1 = new VarInsnNode(opc.ALOAD, 0)
		var op2 = asmapi.buildMethodCall(n2, f2, "()V", asmapi.MethodType.SPECIAL)
		var list = asmapi.listOf(op1, op2)
		obj.instructions.insert(node, list)
	}
	else
		asmapi.log("ERROR", "Failed to modify BeehiveBlockEntity: discard not found")
}

// tickOccupants - if remove called then call BlockEntity#setChanged(Level,BlockPos,BlockState)
function patch_m_155149_(obj) {
	var f1 = "remove"
	var n1 = "java/util/Iterator"
	var node = asmapi.findFirstMethodCall(obj, asmapi.MethodType.INTERFACE, n1, f1, "()V")
	if (node) {
		var f2 = asmapi.mapMethod('m_155232_') // setChanged
		var n2 = "net/minecraft/world/level/block/entity/BeehiveBlockEntity"
		var d2 = "(Lnet/minecraft/world/level/Level;Lnet/minecraft/core/BlockPos;Lnet/minecraft/world/level/block/state/BlockState;)V"
		var op1 = new VarInsnNode(opc.ALOAD, 0)
		var op2 = new VarInsnNode(opc.ALOAD, 1)
		var op3 = new VarInsnNode(opc.ALOAD, 2)
		var op4 = asmapi.buildMethodCall(n2, f2, d2, asmapi.MethodType.STATIC)
		var list = asmapi.listOf(op1, op2, op3, op4)
		obj.instructions.insert(node, list)
	}
	else
		asmapi.log("ERROR", "Failed to modify BeehiveBlockEntity: remove not found")
	return
}
