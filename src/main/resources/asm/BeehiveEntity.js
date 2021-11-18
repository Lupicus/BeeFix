var asmapi = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var AbstractInsnNode = Java.type('org.objectweb.asm.tree.AbstractInsnNode')
var LabelNode = Java.type('org.objectweb.asm.tree.LabelNode')
var VarInsnNode = Java.type('org.objectweb.asm.tree.VarInsnNode')
var FieldInsnNode = Java.type('org.objectweb.asm.tree.FieldInsnNode')
var JumpInsnNode = Java.type('org.objectweb.asm.tree.JumpInsnNode')
var TypeInsnNode = Java.type('org.objectweb.asm.tree.TypeInsnNode')
var InsnNode = Java.type('org.objectweb.asm.tree.InsnNode')

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
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn) {
    					patch_m_58744_(obj)
    					count++
    				}
    			}
    			if (count < 1)
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
